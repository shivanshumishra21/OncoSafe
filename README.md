# OncoSafe – Oncology Pharmacy Assistant System

A full-stack web application to assist oncology pharmacists in prescription validation, drug interaction checking, BSA-based dose calculation, inventory tracking, and patient-specific safety alerts.

## 🆕 Live API Integration

OncoSafe now uses **real-time drug data** from public APIs:
- **RxNorm API** - Drug search and interaction checking (no API key required)
- **OpenFDA API** - Drug warnings and toxicity information (no API key required)

No hardcoded drug data or seed files needed!

## Tech Stack

- **Backend**: Django + Django REST Framework + SQLite
- **Frontend**: React (Vite) + Tailwind CSS
- **Authentication**: JWT (djangorestframework-simplejwt)
- **External APIs**: RxNorm, OpenFDA

## Project Structure

```
oncosafe/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── oncosafe/
│   │   ├── settings.py
│   │   ├── urls.py
│   └── apps/
│       ├── drugs/
│       ├── patients/
│       ├── prescriptions/
│       └── inventory/
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── pages/
        ├── components/
        └── api/
```

## Setup Instructions

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # Optional: create admin user
python manage.py runserver
```

The backend will run on `http://localhost:8000`

**Note:** No seed data needed! All drug information comes from live RxNorm and OpenFDA APIs.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Features

### 1. Live Drug Data Integration
- **RxNorm API** for real-time drug search
- **OpenFDA API** for warnings and toxicity information
- Intelligent caching to minimize API calls
- No API keys required

### 2. Drug Interaction Checking
- Order-independent interaction detection via RxNorm
- Severity levels: Safe, Moderate, Dangerous
- Real-time validation from authoritative sources

### 3. Patient Risk Alerts
- Organ-specific toxicity warnings from OpenFDA
- Contraindication detection
- Dynamic risk assessment based on patient status
- Black box warning alerts

### 4. BSA-Based Dose Calculator
- Automatic Body Surface Area calculation
- Drug-specific dose recommendations
- Standard chemotherapy dosing protocols

### 5. Inventory Management
- Expiry date tracking (30-day alerts)
- Low stock warnings (quantity < 10)
- Storage type classification

### 6. JWT Authentication
- Secure token-based authentication
- Protected API endpoints
- User registration and login

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login (returns JWT token)

### Drugs
- `GET /api/drugs/?search=cisplatin` - Search drugs via RxNorm API
- `GET /api/drugs/<drug_name>/warnings/` - Get OpenFDA warnings for a drug

### Prescription Checker
- `POST /api/prescription/check/` - Check drug interactions via RxNorm and patient risks via OpenFDA

### Dose Calculator
- `POST /api/calculate-dose/` - Calculate BSA-based dose

### Inventory
- `GET /api/inventory/` - List all inventory
- `POST /api/inventory/` - Add inventory entry
- `GET /api/inventory/alerts/` - Get expiry and low stock alerts

## Testing Checklist

- [x] Drug search returns live results from RxNorm
- [x] Interaction check uses RxNorm interaction API
- [x] Warnings fetched from OpenFDA
- [x] Interaction check is order-independent
- [x] BSA calculation: height=170cm, weight=70kg → BSA≈1.78
- [x] Inventory alert triggers when expiry < 30 days
- [x] Inventory alert triggers when quantity < 10
- [x] JWT token required for all protected endpoints
- [x] Invalid patient_id returns 404
- [x] Caching reduces API calls

## API Rate Limits & Caching

The system implements intelligent caching:
- **Drug searches**: Cached for 1 hour
- **Interactions**: Cached for 6 hours
- **Warnings**: Cached for 24 hours

This minimizes API calls while keeping data fresh.

## Testing the APIs

Test drug search:
```bash
curl "http://localhost:8000/api/drugs/?search=cisplatin"
```

Test warnings:
```bash
curl "http://localhost:8000/api/drugs/cisplatin/warnings/"
```

Test prescription check:
```bash
curl -X POST http://localhost:8000/api/prescription/check/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"patient_id": 1, "drug_ids": ["202363", "6851"]}'
```

## License

MIT
