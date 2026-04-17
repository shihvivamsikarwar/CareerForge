# CareerForge

### AI-Powered Career Preparation Platform

CareerForge is a full-stack AI-driven platform designed to help students and job seekers prepare for their careers through resume analysis, mock interviews, performance tracking, and personalized career guidance.

---

##  Features

### Resume Analysis (ATS-Based)

* Extracts resume data using NLP techniques
* Calculates ATS score using rule-based scoring
* Provides strengths, weaknesses, and suggestions

---

###  AI Mock Interview

* Dynamic question generation based on skills
* Difficulty levels (Easy / Medium / Hard)
* AI-based answer evaluation
* Real-time feedback

---

###  Anti-Cheating System

* Tab switch detection
* Copy-paste restriction
* Fullscreen monitoring
* Integrity score tracking

---

###  Performance Dashboard

* Interview score tracking
* Improvement trend analysis
* Strength & weakness detection
* AI insights

---

###  Job Analyzer

* Match score calculation
* Skill gap analysis
* Suggestions for improvement
* History tracking

---

###  Career Guidance (AI)

* Recommended career paths
* Job roles suggestion
* Learning roadmap
* Job readiness score

---

###  Global Settings

* Interview difficulty control
* AI behavior customization
* Theme (Dark/Light mode)
* Personalized experience

---

##  Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js

### Database

* MongoDB (Mongoose)

### AI Integration

* OpenRouter API (Mistral model)

---

##  System Architecture

```text
Frontend (React)
        ↓
Backend API (Node.js + Express)
        ↓
Database (MongoDB)
        ↓
AI Engine (OpenRouter)
```

---

##  Core Logic

### ATS Score Calculation

```text
ATS Score =
(Keyword Match * 40%) +
(Skills Match * 30%) +
(Structure * 20%) +
(Experience * 10%)
```

---

### Interview Evaluation

```text
Score =
(Accuracy * 40%) +
(Clarity * 30%) +
(Depth * 30%)
```

---

### Job Match Score

```text
Match Score =
(Matched Skills / Required Skills) * 100
```

---

### Job Readiness

```text
Readiness =
(ATS + Interview + Job Match) / 3
```

---

##  Security

* JWT Authentication
* Protected Routes
* Password hashing using bcrypt
* Backend validation for cheating detection

---

##  Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/your-username/careerforge.git
cd careerforge
```

---

### 2. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

---

### 3. Setup Environment Variables

Create `.env` file in backend:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
OPENROUTER_API_KEY=your_api_key
OPENROUTER_MODEL=mistralai/mistral-7b-instruct
```

---

### 4. Run Project

```bash
# Backend
npm run dev

# Frontend
npm run dev
```

---

##  Future Scope

* Real job API integration
* Video interview analysis (AI)
* Mobile application
* Advanced ML-based recommendation system

---

##  Author

**Shivam Sikarwar**
**Neetesh Dixit**
**Akash Gurjar**
**Yatendra Dhakar**
B.Tech CSE
ITM University, Gwalior

---

## Acknowledgement

This project is developed as part of academic learning and project-based learning to explore AI integration in career development systems.

---

##  Conclusion

CareerForge provides a complete AI-powered ecosystem for career preparation by combining resume analysis, interview evaluation, performance tracking, and intelligent career guidance.

---

⭐ If you like this project, give it a star on GitHub!
