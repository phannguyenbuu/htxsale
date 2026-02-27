# HTX Sale

A mobile-first web application for managing HTX sales, inventory, and drivers.

## Tech Stack
- **Frontend:** React (Vite), Styled Components, Axios, HTML5 QR Code Scanner.
- **Backend:** Flask, SQLAlchemy, QRCode, Pillow.
- **Database:** PostgreSQL (via Docker).

## Setup Instructions

### 1. Database (PostgreSQL)
Ensure you have Docker installed. Run the database container:
```bash
docker-compose up -d
```
Alternatively, you can use a local PostgreSQL installation and update the `DATABASE_URL` in `backend/app.py` or `.env`.

### 2. Backend
Navigate to the `backend` folder:
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
The backend runs on `http://localhost:5000`.

### 3. Frontend
Navigate to the `frontend` folder:
```bash
cd frontend
npm install
npm run dev
```
The frontend runs on `http://localhost:5173`.

## Default Credentials
- **Admin:** `admin` / `admin` (Created automatically on first run).
- **QR Token for Admin:** `admin-qr-token` (For testing QR login).

## Features
- **Mobile Dashboard:** Create orders (Up Bill), Auto-fill driver details, Export Bills as PNG with QR.
- **Admin Panel:** Manage Logos, Cards, Sales. View Drivers and Orders.
- **QR Login:** Scan QR code to login instantly.
