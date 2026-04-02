const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

const healthFAQ = {
  'fever': 'Fever is the body\'s natural response to infection. Rest, drink fluids, and take paracetamol. See a doctor if fever exceeds 103°F or persists over 3 days.',
  'malaria': 'Malaria is spread by mosquito bites. Use mosquito nets, repellents. Symptoms include fever, chills, headache. It is treatable - seek immediate medical care.',
  'diabetes': 'Diabetes requires lifelong management. Monitor blood sugar, maintain healthy diet, exercise regularly, take medications as prescribed.',
  'pregnancy': 'During pregnancy: regular antenatal checkups, iron & folic acid supplements, nutritious diet, avoid heavy lifting. Janani Suraksha Yojana provides assistance.',
  'vaccination': 'Children should receive all vaccines as per national immunization schedule. Key vaccines: BCG, Polio, DPT, Hepatitis B, Measles. Free at government health centers.',
  'nutrition': 'Eat balanced diet: grains, pulses, vegetables, fruits, milk. Iron-rich foods: spinach, legumes. Vitamin C helps iron absorption. Drink clean water.',
  'hygiene': 'Wash hands with soap before eating and after toilet. Keep surroundings clean. Boil drinking water if unsafe. Use clean toilets to prevent disease spread.',
  'ayushman': 'Ayushman Bharat (PM-JAY) provides free health coverage up to ₹5 lakh per year for secondary and tertiary care. Covers over 1500 procedures.',
  'blood pressure': 'High BP: reduce salt, exercise, manage stress, take medication. Normal BP: 120/80 mmHg. Check regularly at health centers.',
  'tuberculosis': 'TB is curable with DOTS therapy (6 months). Free treatment available at government hospitals. Symptoms: cough >2 weeks, blood in sputum, weight loss.',
  'default': 'I can help with basic health questions. For symptoms, please use the Symptom Checker. For emergencies, press the Emergency button. Always consult a doctor for medical advice.'
};

router.post('/message', auth, async (req, res) => {
  try {
    const { message, language } = req.body;
    const lowerMsg = message.toLowerCase();

    let response = healthFAQ.default;
    for (const [key, value] of Object.entries(healthFAQ)) {
      if (lowerMsg.includes(key)) {
        response = value;
        break;
      }
    }

    // Daily health tips
    const tips = [
      '💧 Drink at least 8 glasses of water daily',
      '🥗 Eat 5 servings of fruits and vegetables every day',
      '🚶 Walk for 30 minutes daily to maintain good health',
      '😴 Get 7-8 hours of sleep for better immunity',
      '🧼 Wash hands regularly to prevent infections',
      '🌿 Include turmeric and ginger in diet for immunity',
      '☀️ Get 15 mins of sunlight daily for Vitamin D'
    ];

    const dailyTip = tips[new Date().getDay() % tips.length];

    res.json({
      success: true,
      response,
      dailyTip,
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Chatbot error' });
  }
});

// Get daily health tips
router.get('/tips', auth, async (req, res) => {
  const tips = [
    { icon: '💧', category: 'Hydration', tip: 'Drink at least 8 glasses of water daily', language: 'en' },
    { icon: '🥗', category: 'Nutrition', tip: 'Eat seasonal fruits and vegetables for vitamins', language: 'en' },
    { icon: '🚶', category: 'Exercise', tip: 'Walk 30 minutes daily to keep your heart healthy', language: 'en' },
    { icon: '😴', category: 'Sleep', tip: 'Get 7-8 hours of sleep for better immunity', language: 'en' },
    { icon: '🧼', category: 'Hygiene', tip: 'Wash hands with soap for 20 seconds to prevent infections', language: 'en' },
    { icon: '🌿', category: 'Immunity', tip: 'Include turmeric and ginger in your daily diet', language: 'en' },
    { icon: '👶', category: 'Maternal', tip: 'Pregnant women should take iron and folic acid daily', language: 'en' }
  ];
  res.json({ success: true, tips });
});

module.exports = router;
