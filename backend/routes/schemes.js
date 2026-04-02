const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

const schemes = [
  {
    id: 1,
    name: 'Ayushman Bharat (PM-JAY)',
    description: 'Free health coverage up to ₹5 lakh per year for hospitalisation',
    eligibility: { maxIncome: 200000, minAge: 0, maxAge: 100 },
    benefits: 'Cashless treatment at empanelled hospitals, covers 1500+ procedures',
    howToApply: 'Visit nearest Common Service Centre or government hospital',
    icon: '🏥'
  },
  {
    id: 2,
    name: 'Janani Suraksha Yojana (JSY)',
    description: 'Financial assistance for pregnant women for safe delivery',
    eligibility: { gender: 'female', minAge: 18, maxAge: 45 },
    benefits: 'Cash assistance ₹1400 (rural) / ₹1000 (urban) for institutional delivery',
    howToApply: 'Register with ASHA worker or ANM at health sub-center',
    icon: '👶'
  },
  {
    id: 3,
    name: 'Rashtriya Bal Swasthya Karyakram',
    description: 'Free health screening for children 0-18 years',
    eligibility: { maxAge: 18 },
    benefits: '4D screening: Defects, Deficiencies, Diseases, Development delays',
    howToApply: 'Available at schools and Anganwadi centers',
    icon: '🧒'
  },
  {
    id: 4,
    name: 'Pradhan Mantri Surakshit Matritva Abhiyan',
    description: 'Free antenatal care on 9th of every month',
    eligibility: { gender: 'female', minAge: 18, maxAge: 45 },
    benefits: 'Free checkups, medications, and lab tests for pregnant women',
    howToApply: 'Visit government health facility on 9th of each month',
    icon: '🤱'
  },
  {
    id: 5,
    name: 'National Health Mission',
    description: 'Comprehensive primary healthcare for rural populations',
    eligibility: { maxIncome: 500000 },
    benefits: 'Free medicines, diagnostics, and healthcare services',
    howToApply: 'Available at all government health centers',
    icon: '💊'
  }
];

router.get('/', auth, async (req, res) => {
  try {
    const { age, gender, income } = req.user;
    
    const eligible = schemes.filter(scheme => {
      const e = scheme.eligibility;
      if (e.gender && e.gender !== gender) return false;
      if (e.minAge && age < e.minAge) return false;
      if (e.maxAge && age > e.maxAge) return false;
      if (e.maxIncome && income > e.maxIncome) return false;
      return true;
    });

    res.json({ success: true, schemes: eligible.length > 0 ? eligible : schemes, allSchemes: schemes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch schemes' });
  }
});

module.exports = router;
