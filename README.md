# 🌿 The Saviour — AI Smart Rural Health Assistant

> Empowering rural communities with AI-powered healthcare assistance, symptom analysis, emergency alerts, and digital health records.

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Python 3.8+
- MongoDB (local or Atlas)
- npm or yarn

---

## ⚡ One-Command Setup (Recommended)

```bash
# Clone / extract the project
cd the-saviour

# Install all dependencies
npm run install:all   # runs install in root, backend, frontend

# Start all services
npm run dev
```

---

## 📁 Project Structure

```
the-saviour/
├── frontend/           # React.js frontend
│   ├── src/
│   │   ├── components/ # Sidebar, Layout
│   │   ├── context/    # AuthContext
│   │   ├── pages/      # All page components
│   │   └── utils/      # API helper, translations
│   └── package.json
│
├── backend/            # Node.js + Express API
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── middleware/      # JWT auth
│   └── server.js
│
├── ai_model/           # Python AI / ML
│   ├── disease_prediction.py  # Train the model
│   ├── app.py                 # Flask API server
│   └── requirements.txt
│
├── database/
│   └── schema.js       # MongoDB schema reference
│
└── README.md
```

---

## 🔧 Step-by-Step Installation

### 1. Backend (Node.js)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your config (MongoDB URI, JWT secret, etc.)
npm run dev        # Development with auto-reload
# OR
npm start          # Production
```

### 2. Frontend (React)

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env — set REACT_APP_API_URL=http://localhost:5000/api
npm start          # Opens http://localhost:3000
```

### 3. AI Model (Python Flask)

```bash
cd ai_model
pip install -r requirements.txt
python disease_prediction.py   # Train model (creates models/ directory)
python app.py                  # Start AI API on port 5001
```

---

## 🌐 Environment Variables

### Backend `.env`

| Variable              | Description                        | Example                              |
|-----------------------|------------------------------------|--------------------------------------|
| `PORT`                | Server port                        | `5000`                               |
| `MONGODB_URI`         | MongoDB connection string          | `mongodb://localhost:27017/the-saviour` |
| `JWT_SECRET`          | JWT signing secret (long random)   | `your_super_secret_key`              |
| `AES_SECRET`          | AES-256 encryption key (32+ chars) | `your_32_char_encryption_key_here!`  |
| `TWILIO_ACCOUNT_SID`  | Twilio account SID                 | `ACxxxxxxxxxxxxxxxx`                 |
| `TWILIO_AUTH_TOKEN`   | Twilio auth token                  | `your_twilio_auth_token`             |
| `TWILIO_PHONE_NUMBER` | Twilio SMS number                  | `+1234567890`                        |

### Frontend `.env`

| Variable                    | Description              | Example                              |
|-----------------------------|--------------------------|--------------------------------------|
| `REACT_APP_API_URL`         | Backend API base URL     | `http://localhost:5000/api`          |
| `REACT_APP_GOOGLE_MAPS_KEY` | Google Maps API key      | `AIzaSy...`                          |

---

## 🔑 Getting API Keys

### Twilio (Emergency SMS)
1. Sign up at https://twilio.com
2. Get Account SID and Auth Token from Console
3. Buy a phone number

### Google Maps (Hospital Finder)
1. Go to https://console.cloud.google.com
2. Enable Maps Embed API and Maps JavaScript API
3. Create credentials → API Key

---

## 👥 User Roles

### 🏡 Village User
- AI Symptom Checker with voice input
- Digital health records
- Emergency alert button
- Nearby hospital finder
- Government scheme eligibility
- AI Health Chatbot
- PDF health report download

### 👩‍⚕️ ASHA Worker
- Register villagers without smartphones
- Manage all health records
- Village health statistics (charts)
- Emergency alerts monitoring
- Vaccination tracking

---

## 🤖 AI Features

### Symptom Analysis
- Rule-based + ML disease prediction
- Supports 20 symptoms → 15 diseases
- Returns confidence scores & precautions
- Emergency detection

### Health Chatbot
- FAQ-based responses
- Voice input (Web Speech API)
- Text-to-speech output
- Multi-language support

### Disease Prediction Model
- Training data: 30+ symptom-disease pairs
- Models: Random Forest, Gradient Boosting, Decision Tree
- Accuracy: ~85-90% on test set

---

## 🌐 Multilingual Support

| Language | Code |
|----------|------|
| English  | `en` |
| Hindi    | `hi` |
| Telugu   | `te` |
| Tamil    | `ta` |
| Kannada  | `kn` |

---

## 📱 Mobile Responsiveness

The app is fully responsive. On mobile:
- Sidebar becomes a slide-in drawer
- Large buttons for easy touch interaction
- Voice input for low-literacy users

---

## 🔐 Security

- **Passwords**: bcrypt (cost factor 12)
- **Auth**: JWT with 7-day expiry
- **Health Records**: AES-256 encrypted
- **Access Control**: Role-based (villager / asha_worker)
- **HTTPS**: Use nginx + Let's Encrypt in production

---

## 🚀 Production Deployment

### Option A: Railway / Render (Easy)
1. Push to GitHub
2. Connect Railway.app
3. Add env variables
4. Deploy

### Option B: VPS (Ubuntu)

```bash
# Install Node, MongoDB
sudo apt update && sudo apt install nodejs npm mongodb -y

# Clone and install
git clone <your-repo>
cd the-saviour/backend && npm install
cd ../frontend && npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start backend/server.js --name the-saviour-api
pm2 start ai_model/app.py --interpreter python3 --name the-saviour-ai

# Serve frontend with nginx
# Copy frontend/build to /var/www/html
# Configure nginx reverse proxy to port 5000
```

### Option C: Docker

```bash
# Build and run
docker-compose up --build
```

---

## 📞 Emergency System

When the emergency button is pressed:
1. User's GPS location is captured
2. SMS sent to emergency contacts via Twilio
3. Alert logged in database
4. ASHA worker dashboard shows real-time alert
5. Emergency helplines displayed: 108 (Ambulance), 100 (Police), 104 (Health)

---

## 📊 Health Dashboard Charts (ASHA)

- **Bar Chart**: Disease distribution in village
- **Pie Chart**: Patient age group breakdown
- **Doughnut Chart**: Vaccination completion progress
- All charts built with Chart.js via react-chartjs-2

---

## 🙏 Government Schemes Covered

1. Ayushman Bharat (PM-JAY) — Free ₹5L coverage
2. Janani Suraksha Yojana — Safe delivery assistance
3. PM Surakshit Matritva Abhiyan — Free antenatal care
4. Rashtriya Bal Swasthya Karyakram — Child health screening
5. National Health Mission — Primary healthcare

---

## 🧪 Demo Credentials

Register a new account at `/register` to get started.

- **Village User**: Select role "Village User"
- **ASHA Worker**: Select role "ASHA Worker"

Default password for ASHA-registered villagers = their phone number.

---

## 📄 License

MIT License — Free for rural health & NGO use.

---

*Made with 💚 for rural India — The Saviour*
