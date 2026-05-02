import pandas as pd
from ml_model import AttritionModel
import random

# Load the dataset
df = pd.read_csv('WA_Fn-UseC_-HR-Employee-Attrition.csv')

# Initialize the model
model = AttritionModel()
model.load_model('attrition_model.pkl')

# Mock users for authentication
USERS = [
    {"id": 1, "username": "admin", "password": "admin123", "role": "admin", "name": "Alex Admin", "team": "all"},
    {"id": 9, "username": "admin2", "password": "admin@123", "role": "admin", "name": "Amy Admin", "team": "all"},
    {"id": 2, "username": "hr", "password": "hr123", "role": "hr", "name": "Harsha HR", "team": "Sales"},
    {"id": 3, "username": "employee", "password": "emp123", "role": "employee", "name": "Esha Employee", "team": "Sales"},
    {"id": 4, "username": "tejaswini", "password": "tejaswini123", "role": "hr", "name": "Tejaswini", "team": "Research & Development"},
    {"id": 5, "username": "hemanth", "password": "hemanth123", "role": "employee", "name": "Hemanth", "team": "Sales"},
    {"id": 6, "username": "kavya", "password": "kavya123", "role": "employee", "name": "Kavya", "team": "Research & Development"},
    {"id": 7, "username": "anuja", "password": "anuja123", "role": "hr", "name": "Anuja", "team": "Human Resources"},
    {"id": 8, "username": "harshitha", "password": "harshitha123", "role": "employee", "name": "Harshitha", "team": "Human Resources"},
]

# Generate employees from the full Kaggle dataset
EMPLOYEES = []
for idx, row in df.iterrows():
    employee_data = row.to_dict()
    # Predict attrition risk
    prediction = model.predict_attrition(employee_data)
    employee = {
        "id": str(employee_data.get('EmployeeNumber', f'E{1000 + idx}')),
        "name": f"Employee {idx+1}",  # Simplified name
        "department": employee_data.get('Department', 'Unknown'),
        "job_role": employee_data.get('JobRole', 'Unknown'),
        "risk": prediction['risk_level'],
        "risk_score": round(prediction['attrition_probability'], 2),
        "team": employee_data.get('Department', 'Unknown'),
        "age": int(employee_data.get('Age', 0)),
        "salary": int(employee_data.get('MonthlyIncome', 0)),
        "tenure": int(employee_data.get('YearsAtCompany', 0)),
        "satisfaction": int(employee_data.get('JobSatisfaction', 3)),
    }
    EMPLOYEES.append(employee)

# Calculate dashboard KPIs from real data
total_employees = len(EMPLOYEES)
attrition_count = sum(1 for emp in EMPLOYEES if emp['risk'] in ['High', 'Medium'])
attrition_rate = round((attrition_count / total_employees) * 100, 1) if total_employees > 0 else 0
high_risk_employees = sum(1 for emp in EMPLOYEES if emp['risk'] == 'High')
average_satisfaction = round(sum(emp['satisfaction'] for emp in EMPLOYEES) / total_employees, 1) if total_employees > 0 else 0

DASHBOARD_KPI = {
    "total_employees": total_employees,
    "attrition_rate": attrition_rate,
    "high_risk_employees": high_risk_employees,
    "average_satisfaction": average_satisfaction,
}

EMPLOYEE_PERFORMANCE = {
    3: {
        "employee_id": EMPLOYEES[0]['id'] if EMPLOYEES else "EMP-9932",
        "performance_rating": random.uniform(3.5, 4.5),
        "job_satisfaction": EMPLOYEES[0]['satisfaction'] if EMPLOYEES else 4.1,
        "years_at_company": EMPLOYEES[0]['tenure'] if EMPLOYEES else 3.8,
        "current_role": EMPLOYEES[0]['job_role'] if EMPLOYEES else "Data Analyst",
        "manager": "R. Kapoor",
        "goals_completion": random.randint(80, 95),
        "recommendation": "Continue skill growth plan",
    }
}

for user_id, idx, manager in [(5, 1, "Kavya Rao"), (6, 2, "Anuja N"), (8, 3, "Hemanth S")]:
    source = EMPLOYEES[idx % len(EMPLOYEES)] if EMPLOYEES else {}
    EMPLOYEE_PERFORMANCE[user_id] = {
        "employee_id": source.get('id', f"EMP-{9900 + user_id}"),
        "performance_rating": random.uniform(3.4, 4.7),
        "job_satisfaction": source.get('satisfaction', random.randint(3, 5)),
        "years_at_company": source.get('tenure', random.randint(1, 8)),
        "current_role": source.get('job_role', "Analyst"),
        "department": source.get('department', "General"),
        "manager": manager,
        "goals_completion": random.randint(78, 96),
        "recommendation": "Continue skill growth plan",
    }
