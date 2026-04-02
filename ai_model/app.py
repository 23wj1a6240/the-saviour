"""
The Saviour - Flask AI Prediction API
Exposes the ML model as a REST endpoint for the Node.js backend to call.
Run: pip install flask scikit-learn numpy pandas && python app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle
import json
import os
import sys

app = Flask(__name__)
CORS(app)

# Load model artifacts
MODEL   = None
LE      = None
SYMPTOMS = []

def load_artifacts():
    global MODEL, LE, SYMPTOMS
    try:
        with open('models/disease_model.pkl', 'rb') as f:
            MODEL = pickle.load(f)
        with open('models/label_encoder.pkl', 'rb') as f:
            LE = pickle.load(f)
        with open('models/symptoms.json') as f:
            SYMPTOMS = json.load(f)
        print("✅ AI model loaded successfully")
        return True
    except FileNotFoundError:
        print("⚠️  Model not found. Run disease_prediction.py first to train the model.")
        return False

# Precaution database
PRECAUTIONS = {
    'Malaria':          ['Take antimalarial medication', 'Use mosquito nets', 'Stay indoors at night', 'See a doctor immediately'],
    'Dengue':           ['Rest and stay hydrated', 'Take paracetamol only', 'Avoid aspirin/ibuprofen', 'Monitor platelet count'],
    'Typhoid':          ['Take prescribed antibiotics', 'Drink boiled water only', 'Eat light, easily digestible food', 'Complete full antibiotic course'],
    'Common Cold':      ['Rest well', 'Drink warm fluids', 'Gargle with warm salt water', 'Avoid cold foods'],
    'Tuberculosis':     ['Start DOTS therapy immediately', 'Complete 6-month treatment', 'Cover mouth when coughing', 'Isolate from children temporarily'],
    'Pneumonia':        ['Take prescribed antibiotics', 'Rest completely', 'Stay warm', 'Seek immediate hospital care if severe'],
    'Gastroenteritis':  ['Take ORS regularly', 'Eat light food — rice, banana', 'Avoid dairy temporarily', 'Wash hands frequently'],
    'Diabetes':         ['Monitor blood sugar daily', 'Follow diabetic diet', 'Exercise regularly', 'Take medications as prescribed'],
    'Hypertension':     ['Reduce salt intake', 'Exercise 30 minutes daily', 'Avoid stress', 'Take BP medications regularly'],
    'Anemia':           ['Eat iron-rich foods (spinach, dates)', 'Take iron supplements', 'Add vitamin C to diet', 'Get regular blood tests'],
    'Chickenpox':       ['Do not scratch the rash', 'Apply calamine lotion', 'Take antihistamines for itching', 'Isolate to prevent spread'],
    'Chikungunya':      ['Rest and stay hydrated', 'Take paracetamol for joint pain', 'Use mosquito repellent', 'Apply warm compress to joints'],
    'Migraine':         ['Rest in dark quiet room', 'Apply cold pack to head', 'Take prescribed migraine medicines', 'Avoid triggers (bright light, noise)'],
    'Appendicitis':     ['SEEK EMERGENCY CARE IMMEDIATELY', 'Do not eat or drink', 'Do not apply heat to abdomen', 'Surgery may be required'],
    'Food Poisoning':   ['Drink ORS or coconut water', 'Eat light food after 4-6 hours', 'Avoid solid food temporarily', 'See doctor if vomiting persists'],
}

@app.route('/predict', methods=['POST'])
def predict():
    if MODEL is None:
        return jsonify({
            'success': False,
            'message': 'Model not trained yet. Run disease_prediction.py first.',
            'fallback': True
        }), 503

    data     = request.get_json()
    symptoms = data.get('symptoms', [])

    if not symptoms:
        return jsonify({'success': False, 'message': 'No symptoms provided'}), 400

    # Normalise symptom names
    symptoms_norm = [s.lower().replace(' ', '_') for s in symptoms]

    # Build feature vector
    vec = np.array([1 if s in symptoms_norm else 0 for s in SYMPTOMS]).reshape(1, -1)

    # Predict
    proba   = MODEL.predict_proba(vec)[0]
    top_idx = np.argsort(proba)[::-1][:4]

    predictions = [
        {
            'disease':     LE.classes_[i],
            'confidence':  round(float(proba[i]) * 100, 1),
            'severity':    'high' if proba[i] > 0.6 else ('medium' if proba[i] > 0.3 else 'low'),
            'precautions': PRECAUTIONS.get(LE.classes_[i], ['Consult a doctor', 'Rest and stay hydrated'])
        }
        for i in top_idx if proba[i] > 0.05
    ]

    emergency_symptoms = {'chest_pain', 'breathlessness', 'unconscious', 'severe_bleeding'}
    is_emergency       = bool(emergency_symptoms.intersection(set(symptoms_norm)))

    return jsonify({
        'success':     True,
        'predictions': predictions,
        'isEmergency': is_emergency,
        'recommendation': 'SEEK IMMEDIATE MEDICAL ATTENTION' if is_emergency else 'Consult a doctor within 24-48 hours'
    })

@app.route('/symptoms', methods=['GET'])
def get_symptoms():
    return jsonify({'symptoms': SYMPTOMS})

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': MODEL is not None})

if __name__ == '__main__':
    load_artifacts()
    port = int(os.environ.get('PORT', 5001))
    print(f"🤖 AI API running on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
