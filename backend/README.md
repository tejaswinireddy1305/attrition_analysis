# Attrition Backend (Flask)

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

API base URL: `http://localhost:5000`

## Demo Login Users

- Admin: `admin / admin123`
- Admin: `admin2 / admin@123`
- HR: `hr / hr123`
- Employee: `employee / emp123`

## Main Endpoints

- `POST /api/auth/login`
- `GET /api/me`
- `GET /api/dashboard/analytics` (admin, hr)
- `GET /api/dashboard/employee` (employee)
- `GET /api/employees` (admin, hr)
- `POST /api/employees` (admin, hr)
- `PUT /api/employees/<id>` (admin, hr; HR limited to own team)
- `DELETE /api/employees/<id>` (admin, hr; HR limited to own team)

## Login Request Body

```json
{
  "role": "hr",
  "username": "hr",
  "password": "hr123"
}
```

Use the returned token as:

`Authorization: Bearer <token>`
