import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

class AttritionModel:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoders = {}
        self.feature_columns = None

    def load_data(self, filepath):
        """Load the dataset from CSV"""
        self.df = pd.read_csv(filepath)
        print(f"Dataset loaded with shape: {self.df.shape}")
        print(self.df.head())

    def preprocess_data(self):
        """Preprocess the data for ML"""
        # Drop unnecessary columns
        columns_to_drop = ['EmployeeNumber', 'EmployeeCount', 'Over18', 'StandardHours']
        self.df = self.df.drop(columns=columns_to_drop, errors='ignore')

        # Handle categorical variables
        categorical_cols = self.df.select_dtypes(include=['object']).columns
        for col in categorical_cols:
            if col != 'Attrition':  # Don't encode target
                le = LabelEncoder()
                self.df[col] = le.fit_transform(self.df[col])
                self.label_encoders[col] = le

        # Encode target variable
        self.df['Attrition'] = self.df['Attrition'].map({'Yes': 1, 'No': 0})

        # Store feature columns
        self.feature_columns = [col for col in self.df.columns if col != 'Attrition']

        print(f"Data preprocessed. Shape: {self.df.shape}")
        print(f"Attrition distribution: {self.df['Attrition'].value_counts()}")

    def train_model(self):
        """Train the Random Forest model"""
        X = self.df[self.feature_columns]
        y = self.df['Attrition']

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Scale features
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # Train model
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train_scaled, y_train)

        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"Model Accuracy: {accuracy:.4f}")
        print(classification_report(y_test, y_pred))

    def save_model(self, filepath='attrition_model.pkl'):
        """Save the trained model"""
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoders': self.label_encoders,
            'feature_columns': self.feature_columns
        }
        joblib.dump(model_data, filepath)
        print(f"Model saved to {filepath}")

    def load_model(self, filepath='attrition_model.pkl'):
        """Load a trained model"""
        if os.path.exists(filepath):
            model_data = joblib.load(filepath)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.label_encoders = model_data['label_encoders']
            self.feature_columns = model_data['feature_columns']
            print(f"Model loaded from {filepath}")
        else:
            print(f"Model file {filepath} not found")

    def predict_attrition(self, employee_data):
        """Predict attrition risk for a single employee"""
        # Convert to DataFrame
        if isinstance(employee_data, dict):
            employee_data = pd.DataFrame([employee_data])

        # Encode categorical variables
        for col, le in self.label_encoders.items():
            if col in employee_data.columns:
                employee_data[col] = le.transform(employee_data[col])

        # Ensure all feature columns are present
        for col in self.feature_columns:
            if col not in employee_data.columns:
                employee_data[col] = 0  # or some default

        employee_data = employee_data[self.feature_columns]

        # Scale
        employee_scaled = self.scaler.transform(employee_data)

        # Predict
        prediction = self.model.predict(employee_scaled)
        probability = self.model.predict_proba(employee_scaled)

        return {
            'attrition_prediction': int(prediction[0]),
            'attrition_probability': float(probability[0][1]),
            'risk_level': 'High' if probability[0][1] > 0.7 else 'Medium' if probability[0][1] > 0.3 else 'Low'
        }

if __name__ == "__main__":
    # Train and save model
    model = AttritionModel()
    model.load_data('WA_Fn-UseC_-HR-Employee-Attrition.csv')
    model.preprocess_data()
    model.train_model()
    model.save_model()