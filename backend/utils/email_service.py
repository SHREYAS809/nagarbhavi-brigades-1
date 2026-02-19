from flask_mail import Message
from flask import current_app
from backend.utils.extensions import mail
from threading import Thread

def send_async_email(app, msg):
    with app.app_context():
        try:
            mail.send(msg)
            print(f"✅ Email sent to {msg.recipients}")
        except Exception as e:
            print(f"❌ Failed to send email: {str(e)}")

def send_email(subject, recipients, html_body):
    try:
        msg = Message(subject, sender=current_app.config['MAIL_USERNAME'], recipients=recipients)
        msg.html = html_body
        # Use threading to avoid blocking
        Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()
        print(f"Attempting to send email to {recipients}...")
    except Exception as e:
        print(f"❌ Error preparing email: {str(e)}")
