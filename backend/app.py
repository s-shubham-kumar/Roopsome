"""
ROOPSOME - Complete Backend API
Salon Queue Management System
"""

import os
import uuid
import logging
from datetime import datetime, timedelta
from functools import wraps

import bcrypt
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, request, jsonify
from flask_cors import CORS
from jose import JWTError, jwt
from dotenv import load_dotenv

# ── Setup ──────────────────────────────────────────────────────────────────
load_dotenv()
from datetime import date, time, datetime
import decimal

app = Flask(__name__)
CORS(app)

# ── Fix: Custom JSON serializer for time, date, decimal types ──
class CustomJSON(app.json_provider_class):
    def default(self, obj):
        if isinstance(obj, (time, datetime)):
            return obj.strftime('%H:%M:%S')
        if isinstance(obj, date):
            return obj.strftime('%Y-%m-%d')
        if isinstance(obj, decimal.Decimal):
            return float(obj)
        return super().default(obj)

app.json_provider_class = CustomJSON
app.json = CustomJSON(app)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Config ─────────────────────────────────────────────────────────────────
DB_HOST     = os.getenv('DB_HOST', 'localhost')
DB_PORT     = os.getenv('DB_PORT', '5432')
DB_NAME     = os.getenv('DB_NAME', 'roopsome_db')
DB_USER     = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
JWT_SECRET  = os.getenv('JWT_SECRET', 'secret')
JWT_ALGO    = 'HS256'
JWT_HOURS   = 24

# ── Database ───────────────────────────────────────────────────────────────

def get_db():
    return psycopg2.connect(
        host=DB_HOST, port=DB_PORT,
        database=DB_NAME, user=DB_USER, password=DB_PASSWORD
    )

def query(sql, params=None, one=False):
    conn = None
    try:
        conn = get_db()
        cur  = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(sql, params or ())
        if sql.strip().upper().startswith('SELECT'):
            result = cur.fetchone() if one else cur.fetchall()
        else:
            conn.commit()
            result = True
        return result
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"DB Error: {e}")
        raise
    finally:
        if conn:
            conn.close()

# ── Auth Helpers ───────────────────────────────────────────────────────────

def hash_pw(pw):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def check_pw(pw, hashed):
    return bcrypt.checkpw(pw.encode(), hashed.encode())

def make_token(user_id, email, user_type):
    return jwt.encode({
        'user_id'  : user_id,
        'email'    : email,
        'user_type': user_type,
        'exp'      : datetime.utcnow() + timedelta(hours=JWT_HOURS)
    }, JWT_SECRET, algorithm=JWT_ALGO)

def decode_token(token):
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except JWTError:
        return None

def auth(roles=None):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = None
            header = request.headers.get('Authorization', '')
            if header.startswith('Bearer '):
                token = header.split(' ')[1]
            if not token:
                return jsonify({'error': 'Token missing'}), 401
            payload = decode_token(token)
            if not payload:
                return jsonify({'error': 'Invalid token'}), 401
            if roles and payload['user_type'] not in roles:
                return jsonify({'error': 'Unauthorized'}), 403
            request.uid  = payload['user_id']
            request.email = payload['email']
            request.role = payload['user_type']
            return f(*args, **kwargs)
        return wrapper
    return decorator

# ══════════════════════════════════════════════════════════════════════════
# AUTH ROUTES
# ══════════════════════════════════════════════════════════════════════════

@app.route('/api/v1/auth/signup', methods=['POST'])
def signup():
    d = request.json
    user_type = d.get('user_type', 'customer')
    email     = d.get('email', '').strip().lower()
    phone     = d.get('phone', '').strip()
    password  = d.get('password', '')
    full_name = d.get('full_name', '').strip()

    if not all([email, phone, password, full_name]):
        return jsonify({'error': 'All fields required'}), 400
    if len(password) < 6:
        return jsonify({'error': 'Password min 6 characters'}), 400
    if user_type not in ['customer', 'barber', 'salon_owner']:
        return jsonify({'error': 'Invalid user type'}), 400

    if query('SELECT id FROM users WHERE email=%s OR phone=%s',
             (email, phone), one=True):
        return jsonify({'error': 'Email or phone already exists'}), 400

    uid = str(uuid.uuid4())
    query('''INSERT INTO users
             (id, user_type, email, phone, password_hash, full_name, is_verified)
             VALUES (%s,%s,%s,%s,%s,%s,TRUE)''',
          (uid, user_type, email, phone, hash_pw(password), full_name))

    return jsonify({
        'message'  : 'Signup successful',
        'token'    : make_token(uid, email, user_type),
        'user_id'  : uid,
        'user_type': user_type,
        'full_name': full_name
    }), 201


@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    d        = request.json
    email    = d.get('email', '').strip().lower()
    password = d.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    user = query('SELECT * FROM users WHERE email=%s', (email,), one=True)
    if not user or not check_pw(password, user['password_hash']):
        return jsonify({'error': 'Invalid credentials'}), 401

    return jsonify({
        'message'  : 'Login successful',
        'token'    : make_token(user['id'], email, user['user_type']),
        'user_id'  : user['id'],
        'user_type': user['user_type'],
        'full_name': user['full_name']
    })


# ══════════════════════════════════════════════════════════════════════════
# SALON ROUTES
# ══════════════════════════════════════════════════════════════════════════

@app.route('/api/v1/salons', methods=['GET'])
def list_salons():
    city = request.args.get('city')
    if city:
        rows = query('''SELECT id, name, address, city, avg_rating,
                               allows_home_service, opening_time, closing_time
                        FROM salons WHERE city=%s AND deleted_at IS NULL
                        ORDER BY avg_rating DESC''', (city,))
    else:
        rows = query('''SELECT id, name, address, city, avg_rating,
                               allows_home_service, opening_time, closing_time
                        FROM salons WHERE deleted_at IS NULL
                        ORDER BY avg_rating DESC LIMIT 50''')
    return jsonify([dict(r) for r in rows])


@app.route('/api/v1/salons/<sid>', methods=['GET'])
def get_salon(sid):
    row = query('SELECT * FROM salons WHERE id=%s AND deleted_at IS NULL',
                (sid,), one=True)
    if not row:
        return jsonify({'error': 'Salon not found'}), 404
    return jsonify(dict(row))


@app.route('/api/v1/salons', methods=['POST'])
@auth(['salon_owner'])
def create_salon():
    d    = request.json
    name = d.get('name', '').strip()
    addr = d.get('address', '').strip()
    city = d.get('city', '').strip()
    if not all([name, addr, city]):
        return jsonify({'error': 'name, address, city required'}), 400

    sid = str(uuid.uuid4())
    query('''INSERT INTO salons
             (id, owner_id, name, description, phone, email,
              address, city, opening_time, closing_time,
              allows_home_service, home_service_charge)
             VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)''',
          (sid, request.uid, name,
           d.get('description',''), d.get('phone',''), d.get('email',''),
           addr, city,
           d.get('opening_time','09:00'), d.get('closing_time','21:00'),
           d.get('allows_home_service', False),
           d.get('home_service_charge', 0)))

    return jsonify({'message': 'Salon created', 'salon_id': sid}), 201


# ══════════════════════════════════════════════════════════════════════════
# SERVICES ROUTES
# ══════════════════════════════════════════════════════════════════════════

@app.route('/api/v1/salons/<sid>/services', methods=['GET'])
def list_services(sid):
    rows = query('''SELECT * FROM services
                    WHERE salon_id=%s AND is_active=TRUE ORDER BY name''',
                 (sid,))
    return jsonify([dict(r) for r in rows])


@app.route('/api/v1/salons/<sid>/services', methods=['POST'])
@auth(['salon_owner'])
def create_service(sid):
    d           = request.json
    name        = d.get('name','').strip()
    base_price  = float(d.get('base_price', 0))
    disc        = float(d.get('discount_percent', 0))
    duration    = int(d.get('duration_minutes', 30))
    category    = d.get('category', 'haircut')

    if not name or base_price <= 0:
        return jsonify({'error': 'name and price required'}), 400

    final = round(base_price * (1 - disc / 100), 2)
    svid  = str(uuid.uuid4())
    query('''INSERT INTO services
             (id, salon_id, name, category, duration_minutes,
              base_price, final_price, is_active)
             VALUES (%s,%s,%s,%s,%s,%s,%s,TRUE)''',
          (svid, sid, name, category, duration, base_price, final))

    return jsonify({'message': 'Service created', 'service_id': svid}), 201


# ══════════════════════════════════════════════════════════════════════════
# STAFF ROUTES
# ══════════════════════════════════════════════════════════════════════════

@app.route('/api/v1/salons/<sid>/staff', methods=['GET'])
def list_staff(sid):
    rows = query('''SELECT * FROM staff
                    WHERE salon_id=%s AND is_available=TRUE ORDER BY name''',
                 (sid,))
    return jsonify([dict(r) for r in rows])


@app.route('/api/v1/salons/<sid>/staff', methods=['POST'])
@auth(['salon_owner'])
def create_staff(sid):
    d    = request.json
    name = d.get('name','').strip()
    if not name:
        return jsonify({'error': 'name required'}), 400

    stid = str(uuid.uuid4())
    query('''INSERT INTO staff
             (id, salon_id, name, phone, specialization,
              max_concurrent_customers, shift_start_time, shift_end_time)
             VALUES (%s,%s,%s,%s,%s,%s,%s,%s)''',
          (stid, sid, name,
           d.get('phone',''), d.get('specialization',''),
           int(d.get('max_concurrent_customers', 1)),
           d.get('shift_start_time','09:00'),
           d.get('shift_end_time','21:00')))

    return jsonify({'message': 'Staff added', 'staff_id': stid}), 201


# ══════════════════════════════════════════════════════════════════════════
# SLOTS ROUTES
# ══════════════════════════════════════════════════════════════════════════

@app.route('/api/v1/slots', methods=['GET'])
def get_slots():
    staff_id = request.args.get('staff_id')
    date     = request.args.get('date')
    if not staff_id or not date:
        return jsonify({'error': 'staff_id and date required'}), 400

    rows = query('''SELECT id, slot_time, max_capacity, booked_count,
                           (max_capacity - booked_count) AS available
                    FROM time_slots
                    WHERE staff_id=%s AND slot_date=%s AND is_blocked=FALSE
                    ORDER BY slot_time''',
                 (staff_id, date))
    return jsonify([dict(r) for r in rows])


# ══════════════════════════════════════════════════════════════════════════
# BOOKING ROUTES
# ══════════════════════════════════════════════════════════════════════════

@app.route('/api/v1/bookings', methods=['POST'])
@auth(['customer'])
def create_booking():
    d            = request.json
    salon_id     = d.get('salon_id')
    service_id   = d.get('service_id')
    staff_id     = d.get('staff_id')
    slot_id      = d.get('slot_id')
    booking_date = d.get('booking_date')
    booking_time = d.get('booking_time')
    btype        = d.get('booking_type', 'salon')
    home_addr    = d.get('home_service_address', '')

    if not all([salon_id, service_id, staff_id, slot_id, booking_date, booking_time]):
        return jsonify({'error': 'Missing required fields'}), 400

    svc = query('SELECT * FROM services WHERE id=%s', (service_id,), one=True)
    if not svc:
        return jsonify({'error': 'Service not found'}), 404

    slot = query('SELECT * FROM time_slots WHERE id=%s', (slot_id,), one=True)
    if not slot or slot['booked_count'] >= slot['max_capacity']:
        return jsonify({'error': 'Slot fully booked'}), 400

    home_charge = 0
    if btype == 'home_service':
        salon = query('SELECT home_service_charge FROM salons WHERE id=%s',
                      (salon_id,), one=True)
        home_charge = float(salon['home_service_charge']) if salon else 0

    total = float(svc['final_price']) + home_charge
    bid   = str(uuid.uuid4())

    query('''INSERT INTO bookings
             (id, salon_id, customer_id, staff_id, service_id, time_slot_id,
              booking_date, booking_time, duration_minutes, booking_type,
              home_service_address, service_price, home_service_charge,
              total_amount, status, barber_response_status)
             VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)''',
          (bid, salon_id, request.uid, staff_id, service_id, slot_id,
           booking_date, booking_time, svc['duration_minutes'],
           btype, home_addr, svc['final_price'],
           home_charge, total, 'pending', 'awaiting'))

    # Update slot count
    query('UPDATE time_slots SET booked_count=booked_count+1 WHERE id=%s',
          (slot_id,))

    # Add to queue
    res = query('''SELECT COALESCE(MAX(queue_position),0)+1 AS nxt
                   FROM queue WHERE salon_id=%s AND queue_date=%s''',
                (salon_id, booking_date), one=True)
    qpos = res['nxt']
    query('''INSERT INTO queue
             (id, salon_id, booking_id, staff_id, customer_id,
              queue_date, queue_position, status)
             VALUES (%s,%s,%s,%s,%s,%s,%s,%s)''',
          (str(uuid.uuid4()), salon_id, bid, staff_id,
           request.uid, booking_date, qpos, 'waiting'))

    return jsonify({
        'message'       : 'Booking created successfully',
        'booking_id'    : bid,
        'queue_position': qpos,
        'total_amount'  : total
    }), 201


@app.route('/api/v1/bookings/<bid>', methods=['GET'])
@auth(['customer','barber','salon_owner'])
def get_booking(bid):
    row = query('''SELECT b.*,
                          s.name  AS service_name,
                          st.name AS staff_name,
                          sal.name AS salon_name
                   FROM bookings b
                   JOIN services s   ON b.service_id = s.id
                   JOIN staff    st  ON b.staff_id   = st.id
                   JOIN salons   sal ON b.salon_id   = sal.id
                   WHERE b.id=%s''', (bid,), one=True)
    if not row:
        return jsonify({'error': 'Booking not found'}), 404
    return jsonify(dict(row))


@app.route('/api/v1/bookings/<bid>/cancel', methods=['PUT'])
@auth(['customer'])
def cancel_booking(bid):
    reason = request.json.get('reason', '')
    bk = query('SELECT * FROM bookings WHERE id=%s AND customer_id=%s',
               (bid, request.uid), one=True)
    if not bk:
        return jsonify({'error': 'Booking not found'}), 404
    if bk['status'] not in ['pending', 'confirmed']:
        return jsonify({'error': 'Cannot cancel this booking'}), 400

    query('''UPDATE bookings SET status=%s, cancelled_at=NOW(),
             cancelled_by=%s, cancellation_reason=%s, refund_amount=%s
             WHERE id=%s''',
          ('cancelled', 'customer', reason, bk['total_amount'], bid))
    query('UPDATE time_slots SET booked_count=booked_count-1 WHERE id=%s',
          (bk['time_slot_id'],))
    query("UPDATE queue SET status='completed' WHERE booking_id=%s", (bid,))

    return jsonify({'message': 'Cancelled', 'refund_amount': bk['total_amount']})


@app.route('/api/v1/my-bookings', methods=['GET'])
@auth(['customer'])
def my_bookings():
    rows = query('''SELECT b.id, b.booking_date, b.booking_time, b.status,
                           b.total_amount, b.barber_response_status,
                           s.name AS service_name,
                           st.name AS staff_name,
                           sal.name AS salon_name
                    FROM bookings b
                    JOIN services s   ON b.service_id = s.id
                    JOIN staff    st  ON b.staff_id   = st.id
                    JOIN salons   sal ON b.salon_id   = sal.id
                    WHERE b.customer_id=%s
                    ORDER BY b.created_at DESC''', (request.uid,))
    return jsonify([dict(r) for r in rows])


# ══════════════════════════════════════════════════════════════════════════
# BARBER ROUTES
# ══════════════════════════════════════════════════════════════════════════

@app.route('/api/v1/barber/bookings', methods=['GET'])
@auth(['barber'])
def barber_bookings():
    rows = query('''SELECT b.*, u.full_name AS customer_name, u.phone,
                           s.name AS service_name
                    FROM bookings b
                    JOIN users    u ON b.customer_id = u.id
                    JOIN services s ON b.service_id  = s.id
                    WHERE b.barber_response_status=%s
                    ORDER BY b.created_at''', ('awaiting',))
    return jsonify([dict(r) for r in rows])


@app.route('/api/v1/bookings/<bid>/accept', methods=['PUT'])
@auth(['barber'])
def accept_booking(bid):
    query('''UPDATE bookings SET barber_response_status=%s, status=%s,
             barber_response_time=NOW() WHERE id=%s''',
          ('accepted', 'confirmed', bid))
    return jsonify({'message': 'Booking accepted'})


@app.route('/api/v1/bookings/<bid>/reject', methods=['PUT'])
@auth(['barber'])
def reject_booking(bid):
    reason = request.json.get('reason', '')
    bk = query('SELECT time_slot_id FROM bookings WHERE id=%s', (bid,), one=True)
    query('''UPDATE bookings SET barber_response_status=%s, status=%s,
             cancellation_reason=%s, barber_response_time=NOW() WHERE id=%s''',
          ('rejected', 'rejected', reason, bid))
    query('UPDATE time_slots SET booked_count=booked_count-1 WHERE id=%s',
          (bk['time_slot_id'],))
    return jsonify({'message': 'Booking rejected'})


@app.route('/api/v1/bookings/<bid>/delay', methods=['PUT'])
@auth(['barber'])
def delay_booking(bid):
    mins   = int(request.json.get('delay_minutes', 15))
    reason = request.json.get('reason', '')
    query('''UPDATE bookings
             SET barber_response_status=%s,
                 delayed_until=NOW() + (%s * INTERVAL '1 minute'),
                 delay_reason=%s,
                 barber_response_time=NOW()
             WHERE id=%s''',
          ('delayed', mins, reason, bid))
    return jsonify({'message': f'Booking delayed by {mins} minutes'})


@app.route('/api/v1/bookings/<bid>/complete', methods=['PUT'])
@auth(['barber'])
def complete_booking(bid):
    query('''UPDATE bookings SET status=%s, queue_position=NULL
             WHERE id=%s''', ('completed', bid))
    query("UPDATE queue SET status='completed', actual_end_time=NOW() WHERE booking_id=%s",
          (bid,))
    return jsonify({'message': 'Booking completed'})


# ══════════════════════════════════════════════════════════════════════════
# QUEUE ROUTES
# ══════════════════════════════════════════════════════════════════════════

@app.route('/api/v1/queue/<salon_id>', methods=['GET'])
def get_queue(salon_id):
    date = request.args.get('date', str(datetime.now().date()))
    rows = query('''SELECT q.queue_position, q.status,
                           b.booking_time, b.duration_minutes, b.id AS booking_id,
                           u.full_name AS customer_name,
                           s.name  AS service_name,
                           st.name AS staff_name
                    FROM queue q
                    JOIN bookings b ON q.booking_id  = b.id
                    JOIN users    u ON b.customer_id = u.id
                    JOIN services s ON b.service_id  = s.id
                    JOIN staff   st ON b.staff_id    = st.id
                    WHERE q.salon_id=%s AND q.queue_date=%s
                      AND b.status IN (%s,%s)
                    ORDER BY q.queue_position''',
                 (salon_id, date, 'pending', 'confirmed'))

    result = []
    wait   = 0
    for r in rows:
        item = dict(r)
        item['estimated_wait_minutes'] = wait
        wait += r['duration_minutes']
        result.append(item)

    return jsonify(result)


# ══════════════════════════════════════════════════════════════════════════
# PAYMENT ROUTES
# ══════════════════════════════════════════════════════════════════════════

try:
    import razorpay
    RAZORPAY_KEY_ID     = os.getenv('RAZORPAY_KEY_ID', '')
    RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', '')
    rzp = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    RAZORPAY_ENABLED = True
except Exception:
    RAZORPAY_ENABLED = False
    logger.warning('Razorpay not configured')


@app.route('/api/v1/payments/create', methods=['POST'])
@auth(['customer'])
def create_payment():
    if not RAZORPAY_ENABLED:
        return jsonify({'error': 'Payment not configured'}), 503

    d          = request.json
    booking_id = d.get('booking_id')
    amount     = float(d.get('amount', 0))

    if not booking_id or amount <= 0:
        return jsonify({'error': 'booking_id and amount required'}), 400

    bk = query('SELECT * FROM bookings WHERE id=%s AND customer_id=%s',
               (booking_id, request.uid), one=True)
    if not bk:
        return jsonify({'error': 'Booking not found'}), 404

    order = rzp.order.create({
        'amount'         : int(amount * 100),
        'currency'       : 'INR',
        'receipt'        : f'bk_{booking_id[:8]}',
        'payment_capture': 1,
        'notes'          : {'booking_id': booking_id}
    })

    pid = str(uuid.uuid4())
    query('''INSERT INTO payments
             (id, booking_id, customer_id, amount, razorpay_order_id, status)
             VALUES (%s,%s,%s,%s,%s,%s)''',
          (pid, booking_id, request.uid, amount, order['id'], 'pending'))

    return jsonify({
        'order_id': order['id'],
        'key_id'  : RAZORPAY_KEY_ID,
        'amount'  : amount
    }), 201


@app.route('/api/v1/payments/verify', methods=['POST'])
@auth(['customer'])
def verify_payment():
    if not RAZORPAY_ENABLED:
        return jsonify({'error': 'Payment not configured'}), 503

    d          = request.json
    order_id   = d.get('razorpay_order_id')
    payment_id = d.get('razorpay_payment_id')
    signature  = d.get('razorpay_signature')
    booking_id = d.get('booking_id')

    try:
        rzp.utility.verify_payment_signature({
            'razorpay_order_id'  : order_id,
            'razorpay_payment_id': payment_id,
            'razorpay_signature' : signature
        })
    except Exception:
        return jsonify({'error': 'Payment verification failed'}), 400

    query('''UPDATE payments
             SET status=%s, razorpay_payment_id=%s, payment_date=NOW()
             WHERE razorpay_order_id=%s''',
          ('completed', payment_id, order_id))

    query('''UPDATE bookings SET status=%s, paid_amount=total_amount
             WHERE id=%s''', ('confirmed', booking_id))

    return jsonify({'message': 'Payment verified', 'booking_id': booking_id})


# ══════════════════════════════════════════════════════════════════════════
# HEALTH CHECK
# ══════════════════════════════════════════════════════════════════════════

@app.route('/api/v1/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()})


@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Server error'}), 500


# ══════════════════════════════════════════════════════════════════════════
if __name__ == '__main__':
    logger.info('🚀 ROOPSOME Backend starting...')
    app.run(debug=True, host='0.0.0.0', port=5000)