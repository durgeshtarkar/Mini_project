# AI-Based-Ophthalmology-Diagnostic-Tool

It is a full-stack web application that uses deep learning to detect common eye diseases from retinal images. It supports secure user authentication, image upload and analysis, PDF report generation, and a built-in chatbot powered by Hugging Face for medical guidance.

---

## 🚀 Features

- 🔐 User registration and login (Flask + SQLAlchemy)
- 🧠 Disease prediction using a trained TensorFlow model
- 📤 Upload retinal images (JPG, JPEG, PNG)
- 📄 PDF report generation with diagnosis and precautions
- 💬 Chatbot powered by Hugging Face (DialoGPT) for medical Q&A
- 🎨 Polished UI with responsive design and animated background
- 📁 Secure file handling and storage

---

## 🧪 Supported Eye Conditions

- Cataract
- Diabetic Retinopathy
- Glaucoma
- Normal

---

## 🛠️ Tech Stack

| Layer        | Tools Used                          |
|--------------|-------------------------------------|
| Frontend     | HTML, CSS, JavaScript, Jinja2       |
| Backend      | Flask, SQLAlchemy, Flask-Login      |
| ML Model     | TensorFlow (Keras .h5 model)        |
| Chatbot      | Hugging Face Transformers (DialoGPT)|
| PDF Reports  | FPDF                                |
| Database     | SQLite                              |
| Deployment   | Gunicorn + Render                   |

---

## 📦 Installation

1. Clone the repository
git clone https://github.com/durgeshtarkar/AI-Based-Ophthalmology-Diagnostic-Tool.git

cd eyeIntel

2. Create a virtual environment

python -m venv tf-env
source tf-env/bin/activate

3. Install dependencies

pip install -r requirements.txt

4. Download or place your trained model

Place your my_model.h5 file inside the model/ directory.

🧑‍⚕️ Usage
1. Run the app
python app.py

2. Open in browser
Visit http://127.0.0.1:5000 to access the app.

3. Upload an image
   
Go to the Detector page, upload a retinal scan, and view the prediction and downloadable PDF report.

