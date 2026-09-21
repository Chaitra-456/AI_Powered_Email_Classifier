# AI-Powered Email Classifier

An ML-based web application that automatically classifies emails into meaningful categories using Natural Language Processing and Machine Learning. The system fetches emails from Gmail, analyzes their content, and organizes them into categories such as Academic, Career & Opportunity, Financial Services, Scholarship, and more.

## 🚀 Live Demo

[Open Live Demo](https://ai-powered-email-classifier.onrender.com)

> Use a Google App Password when connecting your Gmail account. Do not use your regular Gmail password.

## 🔗 Project Links

* **Frontend:** [AI-Powered Email Classifier](https://ai-powered-email-classifier.onrender.com)
* **Backend API:** [FastAPI Backend](https://ai-powered-email-classifier-backend.onrender.com)
* **Source Code:** [GitHub Repository](https://github.com/Chaitra-456/AI_Powered_Email_Classifier)

## Features

* Fetches emails from Gmail using IMAP
* Automatically classifies emails using Machine Learning
* Organizes emails into multiple categories
* Academic email classification
* Career & Opportunity classification
* Financial Services classification
* Campus Service classification
* Scholarship classification
* Skill Development classification
* Service Notification classification
* Spam category
* Email detail view
* React-based web interface
* Deployed frontend and backend

## Machine Learning

The email classifier uses Natural Language Processing and supervised Machine Learning.

### Model Pipeline

1. Email subject, preview, and sender domain are collected.
2. The text is cleaned and combined.
3. TF-IDF converts the text into numerical features.
4. LinearSVC classifies the email.
5. The predicted category is displayed in the React interface.

### Model Performance

| Metric              |    Result |
| ------------------- | --------: |
| Model               | LinearSVC |
| Feature Extraction  |    TF-IDF |
| Training Emails     |       720 |
| Testing Emails      |       180 |
| Correct Predictions |       173 |
| Accuracy            |    96.11% |

## Email Categories

The system supports the following categories:

* Inbox
* Academic
* Administration
* Campus Service
* Career And Opportunity
* Financial Services
* Service Notification
* Scholarship
* Skill Development
* Miscellaneous
* Spam

## Tech Stack

### Frontend

* React.js
* HTML
* CSS
* JavaScript

### Backend

* Python
* FastAPI
* Uvicorn

### Machine Learning

* Scikit-learn
* TF-IDF
* LinearSVC

### Email Integration

* Gmail IMAP

### Development & Deployment

* Git
* GitHub
* Render

## Project Structure

```text
AI_POWERED_EMAIL_CLASSIFIER/
│
├── email_project/
│   ├── backend/
│   │   ├── app.py
│   │   ├── best_model.sav
│   │   ├── tfidf_vectorizer.sav
│   │   └── requirements.txt
│   │
│   └── frontend/
│       ├── public/
│       ├── src/
│       ├── package.json
│       └── package-lock.json
│
├── emaildataset/
│
├── ed.ipynb
└── README.md
```

## Security Note

The application uses a Google App Password for Gmail authentication. Users should never share their Gmail password or App Password publicly, and credentials should not be committed to GitHub.

## Deployment

The project is deployed using Render:

* **React Frontend:** Static Site
* **FastAPI Backend:** Web Service

The frontend communicates with the deployed FastAPI backend for email fetching and classification.

## Author

**Chaitra A J**

Computer Science & Engineering Student
Bengaluru, India
