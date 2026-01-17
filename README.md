# Personality-Privacy-Analyzer
Privacy-aware behavioral analytics system for personality prediction and ethical personalization.


## 🚀 Project Overview  

Modern digital platforms rely heavily on user data for personalization, often at the cost of privacy and trust.  
This project proposes a **privacy-aware behavioral analysis system** that:  

- Extracts aggregated behavioral features from browsing activity  
- Predicts personality type and privacy sensitivity using Machine Learning  
- Generates human-readable  insights  
- Ensures that raw browsing history or personal identifiers are never shared  

---

## 🧠 Core Idea  

Instead of tracking users invasively, the system converts browsing behavior into **anonymous, aggregated features**, which are then used for:  

- Personality inference  
- Privacy risk assessment  
- Ethical, trust-based personalization


  /Analyzer → Browser Extension
├── manifest.json
├── background.js
├── content.js
├── popup.html
└── popup.js

/ML_ENGINE → Machine Learning Backend
├── train_model.py
├── ml_api.py
├── training_data.csv
├── personality_model.pkl
└── privacy_model.pkl

![image alt](https://github.com/student-anusha/Personality-Privacy-Analyzer/blob/9df2c3d5fae9a988342baf687bf0c6edd80d4c4c/Screenshot%202026-01-17%20105724.png)
---

## Privacy Design Principles  

- No raw URLs are shared  
- All analysis is based on aggregated statistics  
- User consent is required before sending any summary  
- AI insights are generated only from anonymized data  

---

## 🎯 Key Features  

- Automated behavior categorization  
- Personality prediction (Introvert / Ambivert / Extrovert)  
- Privacy sensitivity scoring  
- Interactive analytics dashboard  
- CSV export of aggregated results  
- AI-generated privacy-safe insights  

---

##  How to Run  

### **1) Load the Extension**  
1. Open Chrome → `chrome://extensions`  
2. Enable **Developer mode**  
3. Click **Load unpacked**  
4. Select the **Analyzer** folder  

### **2) Start ML Backend**  
```bash
cd ML_ENGINE  
python train_model.py  
python ml_api.py  


