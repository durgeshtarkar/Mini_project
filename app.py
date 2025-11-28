import os
import io
import numpy as np
from PIL import Image
from fpdf import FPDF
from flask import Flask, request, render_template, url_for, redirect, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, login_required, logout_user, UserMixin
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
import tensorflow as tf

# --- Initialization ---
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "your_secret_key")  # secure key from env
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['UPLOAD_FOLDER'] = 'static/uploads/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- Database & Login Setup ---
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# --- User Model ---
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- Lazy Model Loading ---
model = None
MODEL_PATH = 'model/my_model.h5'
CLASS_NAMES = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']

def get_model():
    global model
    if model is None:
        try:
            from keras.losses import SparseCategoricalCrossentropy
            model = tf.keras.models.load_model(
                MODEL_PATH,
                custom_objects={"SparseCategoricalCrossentropy": SparseCategoricalCrossentropy()},
                compile=False
            )
            print("✅ Model loaded successfully.")
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            model = None
    return model

# --- Helper Functions ---
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image_for_prediction(image_bytes):
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img = img.resize((256, 256))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0)
    return img_array

def predict_disease(image_bytes):
    mdl = get_model()
    if mdl is None:
        return "Error", "Model not loaded. Please check the server logs."
    processed_image = preprocess_image_for_prediction(image_bytes)
    predictions = mdl.predict(processed_image)
    predicted_class_index = np.argmax(predictions[0])
    predicted_class = CLASS_NAMES[predicted_class_index]
    confidence = round(100 * np.max(predictions[0]), 2)
    return predicted_class, confidence

def generate_pdf(predicted_class, confidence, filename):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(200, 10, txt="EyeIntel Diagnostic Report", ln=True, align='C')
    pdf.ln(10)
    pdf.cell(200, 10, txt=f"Prediction: {predicted_class}", ln=True)
    pdf.cell(200, 10, txt=f"Confidence: {confidence}%", ln=True)
    pdf.ln(10)

    precautions = {
        "Cataract": "Consult an ophthalmologist for possible surgery. Avoid driving at night.",
        "Diabetic Retinopathy": "Maintain blood sugar levels. Schedule regular eye exams.",
        "Glaucoma": "Use prescribed eye drops. Monitor intraocular pressure regularly.",
        "Normal": "No signs of disease detected. Continue routine eye checkups."
    }

    advice = precautions.get(predicted_class, "Consult a specialist for further evaluation.")
    pdf.multi_cell(0, 10, txt=f"Precautionary Advice:\n{advice}")

    # ✅ Strip extension for clean filename
    base_name = os.path.splitext(filename)[0]
    pdf_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{base_name}_report.pdf")
    pdf.output(pdf_path)
    return pdf_path

# --- Routes ---
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        hashed_pw = generate_password_hash(password, method='pbkdf2:sha256')

        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return redirect(url_for('register'))

        new_user = User(username=username, password=hashed_pw)
        db.session.add(new_user)
        db.session.commit()
        flash('Registration successful. Please log in.')
        return redirect(url_for('login'))

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            login_user(user)
            return redirect(url_for('detector'))
        else:
            flash('Invalid credentials')
            return redirect(url_for('login'))

    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully.')
    return redirect(url_for('login'))

@app.route('/detector', methods=['GET', 'POST'])
@login_required
def detector():
    if request.method == 'POST':
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']

        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image_bytes = file.read()
            with open(filepath, 'wb') as f:
                f.write(image_bytes)

            predicted_class, confidence = predict_disease(image_bytes)
            pdf_path = generate_pdf(predicted_class.replace('_', ' ').title(), confidence, filename)

            return render_template('result.html',
                                   predicted_class=predicted_class.replace('_', ' ').title(),
                                   confidence=confidence,
                                   image_url=url_for('static', filename='uploads/' + filename),
                                   pdf_url=url_for('static', filename='uploads/' + os.path.basename(pdf_path)))

    return render_template('detector.html')

# --- Main Execution ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get("PORT", 5000))  # Render expects PORT env
    app.run(host="0.0.0.0", port=port, debug=False)


