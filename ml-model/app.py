from flask import Flask, request, jsonify # pyrefly: ignore [missing-import]
from flask_cors import CORS # pyrefly: ignore [missing-import]
import pickle
import numpy as np # pyrefly: ignore [missing-import]
import os

app = Flask(__name__)
CORS(app)

model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
try:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/api/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.json
        
        # Extract features
        age = float(data.get('age', 30))
        income = float(data.get('income', 50000))
        
        emp_status_str = data.get('employmentStatus', 'Employed')
        emp_status = 1
        if emp_status_str == 'Unemployed':
            emp_status = 0
        elif emp_status_str == 'Self-Employed':
            emp_status = 2
            
        existing_loans = float(data.get('existingLoans', 0))
        credit_score = float(data.get('creditScore', 700))
        loan_amount = float(data.get('loanAmount', 5000))
        
        # Map payment history to a score (1-10)
        # Assuming frontend sends: 'Excellent', 'Good', 'Fair', 'Poor'
        pay_hist_str = data.get('paymentHistory', 'Good')
        pay_hist = 7
        if pay_hist_str == 'Excellent':
            pay_hist = 10
        elif pay_hist_str == 'Good':
            pay_hist = 7
        elif pay_hist_str == 'Fair':
            pay_hist = 4
        elif pay_hist_str == 'Poor':
            pay_hist = 1
            
        features = np.array([[
            age, income, emp_status, existing_loans, credit_score, loan_amount, pay_hist
        ]])
        
        prediction = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        
        classes = model.classes_
        pred_idx = np.where(classes == prediction)[0][0]
        confidence = float(probabilities[pred_idx])
        
        return jsonify({
            "riskLevel": prediction,
            "probability": confidence
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5001)
