# Nagarbhavi Brigades Backend

This is the Flask backend for the Nagarbhavi Brigades networking platform.

## Features
- **Authentication**: JWT-based auth with Admin/Member roles.
- **Referrals**: Create, track, and close referrals. Email notifications included.
- **Revenue**: Track membership and referral revenue.
- **Meetings**: Schedule and manage chapter meetings.
- **Events**: Event management with member registration.
- **Notifications**: System-wide notifications.

## Prerequisites
- Python 3.8+
- MongoDB (Local or Atlas)

## Setup

1.  **Install Dependencies**:
    ```bash
    pip install -r backend/requirements.txt
    ```

2.  **Environment Variables**:
    Create a `.env` file in the `backend` directory with the following content:
    ```env
    SECRET_KEY=your_secure_secret_key
    MONGO_URI=mongodb://localhost:27017/nagarbhavi_brigades
    MAIL_SERVER=smtp.gmail.com
    MAIL_PORT=587
    MAIL_USE_TLS=True
    MAIL_USERNAME=your_email@gmail.com
    MAIL_PASSWORD=your_app_password
    ```

3.  **Run the Server**:
    From the **root directory** (the folder containing `backend` and `run.py`), execute:
    ```bash
    python run.py
    ```
    The server will run on `http://localhost:5000`.

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/admin-login` - Admin Login

### Referrals
- `GET /api/referrals` - List referrals
- `POST /api/referrals` - Create referral
- `PATCH /api/referrals/<id>/close` - Close referral

### Revenue
- `GET /api/revenue` - List revenue
- `GET /api/revenue/total` - Total revenue
- `GET /api/revenue/monthly` - Monthly breakdown

...and more for Meetings and Events.

## Deployment
- **Render**: Connect your repo, set Root Directory to `.`.
- **Build Command**: `pip install -r backend/requirements.txt`
- **Start Command**: `gunicorn run:app` (Make sure to add `gunicorn` to requirements.txt)
