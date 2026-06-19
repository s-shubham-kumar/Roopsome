import os
import uuid
from supabase import create_client, Client
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Salon, db

salon_bp = Blueprint('salon', __name__)

# Supabase client with SERVICE ROLE KEY (backend only)
supabase: Client = create_client(
    os.environ.get('SUPABASE_URL'),
    os.environ.get('SUPABASE_SERVICE_ROLE_KEY')  # ← service role, not anon
)

BUCKET_NAME = 'Salon _image'

@salon_bp.route('/api/v1/salon/<int:salon_id>/upload-photo', methods=['POST'])
@jwt_required()
def upload_salon_photo(salon_id):
    current_user_id = get_jwt_identity()

    # 1. Ownership verify karo
    salon = Salon.query.filter_by(
        id=salon_id,
        owner_id=current_user_id
    ).first()

    if not salon:
        return jsonify({'error': 'Unauthorized or salon not found'}), 403

    # 2. File check karo
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo file provided'}), 400

    file = request.files['photo']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # 3. File type validate karo
    allowed_types = {'image/jpeg', 'image/png', 'image/webp'}
    if file.mimetype not in allowed_types:
        return jsonify({'error': 'Only JPG, PNG, WebP allowed'}), 400

    # 4. File size check (5MB max)
    file.seek(0, 2)  # end pe jao
    file_size = file.tell()
    file.seek(0)     # wapas start pe

    if file_size > 5 * 1024 * 1024:
        return jsonify({'error': 'Image must be under 5MB'}), 400

    # 5. Unique filename banao
    ext = file.filename.rsplit('.', 1)[-1].lower()
    file_path = f"{salon_id}/{uuid.uuid4().hex}.{ext}"

    # 6. Supabase Storage mein upload karo
    try:
        file_bytes = file.read()

        # Purani photo delete karo (agar hai)
        if salon.photo_url:
            try:
                old_path = salon.photo_url.split(f'{BUCKET_NAME}/')[1]
                supabase.storage.from_(BUCKET_NAME).remove([old_path])
            except Exception:
                pass  # Old photo nahi mili toh skip karo

        # Naya upload
        supabase.storage.from_(BUCKET_NAME).upload(
            path=file_path,
            file=file_bytes,
            file_options={"content-type": file.mimetype}
        )

        # 7. Public URL banao
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_path)

        # 8. DB mein save karo
        salon.photo_url = public_url
        db.session.commit()

        return jsonify({
            'message': 'Photo uploaded successfully',
            'photo_url': public_url
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Upload error: {str(e)}")
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500