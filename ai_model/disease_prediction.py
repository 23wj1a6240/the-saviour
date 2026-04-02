"""
The Saviour - AI Disease Prediction Model
Uses scikit-learn to train a symptom-to-disease classifier.
Run: python disease_prediction.py
API: python app.py  (starts Flask API server)
"""

import numpy as np
import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import pickle
import json
import os

# ─── Training Dataset ────────────────────────────────────────────────────────
# Symptoms: fever, cough, headache, diarrhea, vomiting, chest_pain, fatigue,
#           skin_rash, stomach_pain, joint_pain, sore_throat, body_ache,
#           chills, sweating, nausea, breathlessness, weight_loss, loss_appetite

SYMPTOM_LIST = [
    'fever','cough','headache','diarrhea','vomiting','chest_pain','fatigue',
    'skin_rash','stomach_pain','joint_pain','sore_throat','body_ache',
    'chills','sweating','nausea','breathlessness','weight_loss','loss_appetite',
    'runny_nose','eye_redness'
]

# [fever, cough, headache, diarrhea, vomiting, chest_pain, fatigue,
#  skin_rash, stomach_pain, joint_pain, sore_throat, body_ache,
#  chills, sweating, nausea, breathlessness, weight_loss, loss_appetite,
#  runny_nose, eye_redness]
RAW_DATA = [
    # Malaria
    [1,0,1,1,1,0,1,0,1,1,0,1,1,1,1,0,0,1,0,0,'Malaria'],
    [1,0,1,0,1,0,1,0,0,0,0,1,1,1,0,0,0,1,0,0,'Malaria'],
    [1,0,0,1,0,0,1,0,1,0,0,1,1,1,1,0,0,0,0,0,'Malaria'],
    # Dengue
    [1,0,1,0,1,0,1,1,1,1,0,1,1,1,1,0,0,1,0,1,'Dengue'],
    [1,0,1,0,0,0,1,1,1,1,0,1,0,1,0,0,0,1,0,0,'Dengue'],
    # Typhoid
    [1,0,1,1,1,0,1,0,1,0,0,1,0,1,0,0,1,1,0,0,'Typhoid'],
    [1,0,1,1,0,0,1,0,1,0,0,0,0,1,1,0,1,1,0,0,'Typhoid'],
    # Common Cold
    [1,1,1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,'Common Cold'],
    [0,1,1,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,1,0,'Common Cold'],
    [1,1,0,0,0,0,0,0,0,0,1,1,0,0,1,0,0,0,1,1,'Common Cold'],
    # Tuberculosis
    [1,1,0,0,0,0,1,0,0,0,0,0,0,1,0,1,1,1,0,0,'Tuberculosis'],
    [0,1,0,0,0,1,1,0,0,0,0,0,0,1,0,1,1,1,0,0,'Tuberculosis'],
    # Pneumonia
    [1,1,0,0,0,1,1,0,0,0,0,1,1,1,0,1,0,1,0,0,'Pneumonia'],
    [1,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,0,0,0,0,'Pneumonia'],
    # Gastroenteritis
    [1,0,1,1,1,0,1,0,1,0,0,1,0,0,1,0,0,1,0,0,'Gastroenteritis'],
    [0,0,0,1,1,0,1,0,1,0,0,0,0,0,1,0,0,1,0,0,'Gastroenteritis'],
    # Diabetes
    [0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,1,1,0,0,'Diabetes'],
    [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,'Diabetes'],
    # Hypertension
    [0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'Hypertension'],
    [0,0,1,0,0,1,1,0,0,0,0,0,0,1,1,1,0,0,0,0,'Hypertension'],
    # Anemia
    [0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,0,0,'Anemia'],
    [0,0,1,0,0,0,1,1,0,1,0,1,0,1,0,0,1,1,0,0,'Anemia'],
    # Chickenpox
    [1,0,1,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0,'Chickenpox'],
    [1,0,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,0,'Chickenpox'],
    # Chikungunya
    [1,0,1,0,0,0,1,1,1,1,0,1,1,1,0,0,0,0,0,1,'Chikungunya'],
    [1,0,1,0,0,0,1,1,0,1,0,1,0,1,0,0,0,0,0,0,'Chikungunya'],
    # Migraine
    [0,0,1,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,'Migraine'],
    [0,0,1,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,'Migraine'],
    # Appendicitis
    [1,0,1,0,1,0,1,0,1,0,0,0,0,0,1,0,0,1,0,0,'Appendicitis'],
    # Food Poisoning
    [0,0,1,1,1,0,0,0,1,0,0,1,0,0,1,0,0,1,0,0,'Food Poisoning'],
    [1,0,0,1,1,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,'Food Poisoning'],
]

def build_dataset():
    df = pd.DataFrame(RAW_DATA, columns=SYMPTOM_LIST + ['disease'])
    return df

def train_model(df):
    X = df[SYMPTOM_LIST].values
    y = df['disease'].values
    
    le = LabelEncoder()
    y_enc = le.fit_transform(y)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_enc, test_size=0.2, random_state=42)
    
    # Try multiple models
    models = {
        'RandomForest': RandomForestClassifier(n_estimators=100, random_state=42),
        'GradientBoosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
        'DecisionTree': DecisionTreeClassifier(max_depth=10, random_state=42),
    }
    
    best_model = None
    best_score = 0
    best_name  = ''
    
    for name, model in models.items():
        model.fit(X_train, y_train)
        score = accuracy_score(y_test, model.predict(X_test))
        cv_scores = cross_val_score(model, X, y_enc, cv=min(5, len(df)//5))
        print(f"{name}: Test Acc={score:.3f}, CV={cv_scores.mean():.3f}±{cv_scores.std():.3f}")
        if score > best_score:
            best_score = score
            best_model = model
            best_name  = name
    
    print(f"\n✅ Best model: {best_name} (accuracy: {best_score:.3f})")
    print("\nClassification Report:")
    print(classification_report(y_test, best_model.predict(X_test), target_names=le.classes_))
    
    return best_model, le

def save_artifacts(model, le):
    os.makedirs('models', exist_ok=True)
    with open('models/disease_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    with open('models/label_encoder.pkl', 'wb') as f:
        pickle.dump(le, f)
    with open('models/symptoms.json', 'w') as f:
        json.dump(SYMPTOM_LIST, f)
    print("✅ Model artifacts saved to models/")

def predict(symptoms_input, model=None, le=None):
    """Predict disease from list of symptoms"""
    if model is None:
        with open('models/disease_model.pkl', 'rb') as f:
            model = pickle.load(f)
    if le is None:
        with open('models/label_encoder.pkl', 'rb') as f:
            le = pickle.load(f)
    
    # Build feature vector
    vec = [1 if s in symptoms_input else 0 for s in SYMPTOM_LIST]
    X   = np.array(vec).reshape(1, -1)
    
    proba      = model.predict_proba(X)[0]
    top_idx    = np.argsort(proba)[::-1][:3]
    predictions = [
        {'disease': le.classes_[i], 'confidence': round(proba[i] * 100, 1)}
        for i in top_idx if proba[i] > 0.05
    ]
    return predictions

if __name__ == '__main__':
    print("🌿 The Saviour - Disease Prediction Model Training")
    print("=" * 50)
    df    = build_dataset()
    print(f"Dataset: {len(df)} samples, {len(df['disease'].unique())} diseases")
    model, le = train_model(df)
    save_artifacts(model, le)
    
    # Test prediction
    test_symptoms = ['fever', 'cough', 'chills', 'body_ache']
    print(f"\n🔬 Test prediction for: {test_symptoms}")
    results = predict(test_symptoms, model, le)
    for r in results:
        print(f"  {r['disease']}: {r['confidence']}%")
