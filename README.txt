🧪 Ingredient Safety Checker

A web-based application that allows users to upload or capture images of product ingredient lists and detect harmful chemicals using OCR and a known-chemical database.

-----------------------
🚀 Features

- ✅ Upload or capture product label images
- 🧠 Uses OCR (Tesseract) to extract ingredients
- 🚩 Detects harmful, banned, or allergenic chemicals
- 🔎 Shows detailed information on each harmful ingredient
- 📦 Backend powered by Flask + Tesseract
- 📱 Fully responsive front-end interface

-----------------------
📁 Project Structure

ingredient-checker/
├── app.py                     # Flask backend
├── harmful_ingredients.json   # Database of harmful ingredients
├── requirements.txt           # Python dependencies
├── templates/
│   └── index.html             # Frontend HTML (Flask uses Jinja templates)
├── static/
│   └── script.js              # JavaScript logic (OCR upload, display, etc.)

-----------------------
⚙️ Installation

1. Clone the repository:
    git clone https://github.com/YOUR_USERNAME/ingredient-checker.git
    cd ingredient-checker

2. Set up a virtual environment (optional but recommended):
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate

3. Install required packages:
    pip install -r requirements.txt

4. Install Tesseract OCR:
    - Windows: https://github.com/tesseract-ocr/tesseract
    - Ubuntu/Debian:
        sudo apt update
        sudo apt install tesseract-ocr

-----------------------
▶️ Running the App Locally

    python app.py

Then open your browser at:
    http://localhost:5000

-----------------------
🌐 Deployment (Render)

1. Push your code to GitHub.
2. Go to https://render.com
3. Choose New Web Service
4. Connect your GitHub repo.
5. Set build command:
    pip install -r requirements.txt
6. Set start command:
    python app.py
7. Deploy and you're live! 🎉

-----------------------
📦 Example Harmful Ingredient Entry

{
  "ingredient": "Fragrance / Parfum",
  "aliases": ["Fragrance", "Parfum"],
  "risk_level": "Moderate",
  "health_risks": ["Allergy", "Asthma", "Hormone imbalance"],
  "banned_in": ["Partially restricted in EU"],
  "reason": ["Often contains undisclosed phthalates and allergens"]
}

-----------------------
📸 Recommended Image Guidelines

- Upload a clear, focused photo of the ingredient list
- Blurry or partial images may return a warning
- OCR works best on horizontal, well-lit images

-----------------------
👨‍💻 Created By

Subathran J – for learning, awareness, and educational use.

-----------------------
📄 License

This project is open source and free to use for non-commercial, educational, and research purposes.