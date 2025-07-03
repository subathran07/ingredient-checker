🧪 Ingredient Safety Checker

A Flask-based web app that uses OCR (Tesseract) to extract and analyze ingredients from product labels, helping users identify harmful chemicals in personal care products.

-----------------------------------------------------
🚀 Features

- Upload or capture product label images
- Uses Tesseract OCR to detect text from ingredients
- Detects harmful or banned chemicals
- Gives health risk warnings and banned country info
- Displays clean, formatted results in browser
- Mobile-responsive interface (HTML + JS)

-----------------------------------------------------
📁 Folder Structure

ingredient-checker/
├── app.py                     # Flask backend
├── harmful_ingredients.json   # Chemical database (editable)
├── requirements.txt           # Python dependencies
├── LICENSE                    # MIT License
├── .gitignore                 # Ignore unnecessary files
├── README.txt                 # You're reading this!
├── templates/
│   └── index.html             # Frontend page (Flask uses Jinja2)
├── static/
│   └── script.js              # Handles image upload, camera capture, display

-----------------------------------------------------
⚙️ Prerequisites

Make sure the following are installed:

- Python 3.8+
- pip (Python package manager)
- Tesseract OCR

To install Tesseract:

• Windows: https://github.com/tesseract-ocr/tesseract  
• Ubuntu/Debian:
    sudo apt update
    sudo apt install tesseract-ocr

-----------------------------------------------------
▶️ How to Run Locally

1. Clone the repo or extract the ZIP

2. Open a terminal and navigate to the folder

3. (Optional) Create a virtual environment:
    python -m venv venv
    source venv/bin/activate  (on Windows: venv\Scripts\activate)

4. Install required packages:
    pip install -r requirements.txt

5. Run the app:
    python app.py

6. Open your browser:
    http://localhost:5000

-----------------------------------------------------
📷 How to Use the App

On the web page:

1. 📤 Upload a photo of the ingredient label **OR**
2. 📸 Use your device’s camera to capture it live
3. 🔍 The app scans the image using OCR
4. ⚠️ Highlights any harmful ingredients
5. ✅ If none are found, it says the product appears safe

📌 TIP: Upload a clear, focused image of the full ingredient list.

-----------------------------------------------------
🧪 Sample Ingredient Entry Format

Each entry in `harmful_ingredients.json` looks like:

{
  "ingredient": "Fragrance / Parfum",
  "aliases": ["Parfum", "Fragrance"],
  "risk_level": "Moderate",
  "health_risks": ["Asthma", "Hormone imbalance"],
  "banned_in": ["Partially restricted in EU"],
  "reason": ["May contain undisclosed phthalates"]
}

You can edit this file to expand or improve your chemical database.

-----------------------------------------------------
👨‍💻 Created By

SUBATHRAN J  
For education, health awareness, and software learning.

-----------------------------------------------------
📄 License

MIT License — Free to use, modify, and share.
See LICENSE file for full terms.
