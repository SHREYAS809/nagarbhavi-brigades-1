import os
from flask import Flask
from flask_mail import Mail, Message
from dotenv import load_dotenv

# Load env vars
basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

app = Flask(__name__)

# Config
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

mail = Mail(app)

print(f"Testing Email Config:")
print(f"Username: {app.config['MAIL_USERNAME']}")
print(f"Password: {'*' * 5 if app.config['MAIL_PASSWORD'] else 'Not Set'}")

if not app.config['MAIL_USERNAME'] or not app.config['MAIL_PASSWORD']:
    print("❌ CREDENTIALS MISSING! Please create a .env file in 'backend/' with MAIL_USERNAME and MAIL_PASSWORD.")
    exit(1)

with app.app_context():
    try:
        msg = Message("Test Email from Nagarbhavi Brigades",
                      sender=app.config['MAIL_USERNAME'],
                      recipients=[app.config['MAIL_USERNAME']]) # Send to self
        msg.body = "If you see this, your email configuration is working!"
        mail.send(msg)
        print("✅ Success! Email sent to yourself.")
    except Exception as e:
        print(f"❌ Failed to send: {e}")
