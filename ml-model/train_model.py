import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
import pickle
import os

# Generate Synthetic Data
np.random.seed(42)

n_samples = 1000

# Features:
# age (18 - 70)
# income (20000 - 150000)
# employment_status (0: Unemployed, 1: Employed, 2: Self-Employed)
# existing_loans (0 - 5)
# credit_score (300 - 850)
# loan_amount (1000 - 50000)
# payment_history_score (1 - 10, 10 being best)

age = np.random.randint(18, 70, n_samples)
income = np.random.randint(20000, 150000, n_samples)
employment_status = np.random.choice([0, 1, 2], n_samples, p=[0.1, 0.7, 0.2])
existing_loans = np.random.randint(0, 6, n_samples)
credit_score = np.random.randint(300, 850, n_samples)
loan_amount = np.random.randint(1000, 50000, n_samples)
payment_history_score = np.random.randint(1, 11, n_samples)

# Simple logic to determine Risk (0: Low, 1: Medium, 2: High)
risk_categories = []
for i in range(n_samples):
    risk_score = 0
    if credit_score[i] < 550:
        risk_score += 3
    elif credit_score[i] < 650:
        risk_score += 1
        
    if income[i] < loan_amount[i] / 2:
        risk_score += 2
        
    if payment_history_score[i] < 5:
        risk_score += 2
        
    if employment_status[i] == 0:
        risk_score += 2
        
    if existing_loans[i] > 3:
        risk_score += 1

    if risk_score >= 4:
        risk_categories.append('High Risk')
    elif risk_score >= 2:
        risk_categories.append('Medium Risk')
    else:
        risk_categories.append('Low Risk')

data = pd.DataFrame({
    'age': age,
    'income': income,
    'employment_status': employment_status,
    'existing_loans': existing_loans,
    'credit_score': credit_score,
    'loan_amount': loan_amount,
    'payment_history_score': payment_history_score,
    'risk_category': risk_categories
})

X = data.drop('risk_category', axis=1)
y = data['risk_category']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = DecisionTreeClassifier(max_depth=5, random_state=42)
clf.fit(X_train, y_train)

score = clf.score(X_test, y_test)
print(f"Model trained with accuracy: {score * 100:.2f}%")

model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
with open(model_path, 'wb') as f:
    pickle.dump(clf, f)

print(f"Model saved to {model_path}")
