const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Disease knowledge base (replaces ML model for demo - can be replaced with Python API call)
const diseaseDatabase = {
  fever: { diseases: ['Malaria', 'Dengue', 'Typhoid', 'Common Cold'], precautions: ['Rest', 'Stay hydrated', 'Take paracetamol', 'Consult doctor if persists'] },
  cough: { diseases: ['Common Cold', 'Bronchitis', 'Pneumonia', 'Tuberculosis'], precautions: ['Drink warm fluids', 'Avoid cold', 'Cover mouth while coughing', 'Consult doctor'] },
  headache: { diseases: ['Migraine', 'Tension Headache', 'Hypertension', 'Dengue'], precautions: ['Rest in dark room', 'Stay hydrated', 'Avoid screens', 'Take pain reliever'] },
  diarrhea: { diseases: ['Gastroenteritis', 'Food Poisoning', 'Cholera', 'IBS'], precautions: ['ORS solution', 'Stay hydrated', 'Avoid dairy', 'Wash hands frequently'] },
  vomiting: { diseases: ['Food Poisoning', 'Gastritis', 'Appendicitis', 'Vertigo'], precautions: ['Small sips of water', 'Rest', 'Avoid solid food temporarily', 'Seek medical care'] },
  chest_pain: { diseases: ['Angina', 'Pneumonia', 'GERD', 'Anxiety'], precautions: ['Rest immediately', 'Call emergency', 'Avoid exertion', 'Seek immediate medical help'] },
  fatigue: { diseases: ['Anemia', 'Diabetes', 'Thyroid disorder', 'Depression'], precautions: ['Adequate sleep', 'Nutritious diet', 'Iron-rich foods', 'Blood test recommended'] },
  skin_rash: { diseases: ['Allergic Reaction', 'Chickenpox', 'Measles', 'Scabies'], precautions: ['Avoid scratching', 'Apply calamine lotion', 'Identify allergen', 'Consult dermatologist'] },
  stomach_pain: { diseases: ['Gastritis', 'Appendicitis', 'Kidney Stones', 'Ulcer'], precautions: ['Rest', 'Hot compress', 'Avoid spicy food', 'Consult doctor'] },
  joint_pain: { diseases: ['Arthritis', 'Chikungunya', 'Gout', 'Injury'], precautions: ['Rest affected joint', 'Cold/warm compress', 'Anti-inflammatory', 'Physiotherapy'] }
};

const governmentSchemes = [
  { name: 'Ayushman Bharat', condition: (age, income, gender) => income < 100000, description: 'Free health coverage up to ₹5 lakhs' },
  { name: 'Janani Suraksha Yojana', condition: (age, income, gender) => gender === 'female' && age >= 18 && age <= 45, description: 'Safe motherhood intervention' },
  { name: 'PMJAY', condition: (age, income) => income < 200000, description: 'PM Jan Arogya Yojana - cashless treatment' },
  { name: 'Rashtriya Bal Swasthya Karyakram', condition: (age) => age <= 18, description: 'Free health screening for children' }
];

// Predict disease based on symptoms
router.post('/analyze', auth, async (req, res) => {
  try {
    const { symptoms, age, gender, income } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide symptoms' });
    }

    const results = {};
    const allPrecautions = new Set();
    const matchedDiseases = {};

    symptoms.forEach(symptom => {
      const key = symptom.toLowerCase().replace(' ', '_');
      if (diseaseDatabase[key]) {
        diseaseDatabase[key].diseases.forEach(disease => {
          matchedDiseases[disease] = (matchedDiseases[disease] || 0) + 1;
        });
        diseaseDatabase[key].precautions.forEach(p => allPrecautions.add(p));
      }
    });

    // Sort by frequency
    const sortedDiseases = Object.entries(matchedDiseases)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([disease, count]) => ({
        disease,
        confidence: Math.min(Math.round((count / symptoms.length) * 100), 95),
        severity: count > 2 ? 'high' : count > 1 ? 'medium' : 'low'
      }));

    // Get applicable schemes
    const applicableSchemes = governmentSchemes.filter(scheme =>
      scheme.condition(age || 30, income || 50000, gender || 'male')
    );

    // Emergency flag
    const emergencySymptoms = ['chest_pain', 'difficulty_breathing', 'unconscious', 'severe_bleeding'];
    const isEmergency = symptoms.some(s => emergencySymptoms.includes(s.toLowerCase().replace(' ', '_')));

    res.json({
      success: true,
      analysis: {
        possibleDiseases: sortedDiseases.length > 0 ? sortedDiseases : [{ disease: 'General illness', confidence: 50, severity: 'low' }],
        precautions: Array.from(allPrecautions).slice(0, 6),
        isEmergency,
        recommendation: isEmergency ? 'SEEK IMMEDIATE MEDICAL ATTENTION' : 'Consult a doctor within 24-48 hours',
        applicableSchemes: applicableSchemes.map(s => ({ name: s.name, description: s.description }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Analysis failed', error: err.message });
  }
});

module.exports = router;
