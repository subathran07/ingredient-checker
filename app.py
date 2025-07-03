from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from PIL import Image, ImageEnhance, ImageFilter
import pytesseract
import base64
import io
import json
import re

app = Flask(__name__)
CORS(app)

pytesseract.pytesseract.tesseract_cmd = 'tesseract'  # Use system tesseract on Render

with open('harmful_ingredients.json', 'r', encoding='utf-8') as f:
    harmful_ingredients = json.load(f)

risk_rank = {"Low": 1, "Medium": 2, "Moderate": 2, "High": 3}

def preprocess_image(img):
    img = img.convert('L')
    if img.width < 1200:
        factor = 1200 / img.width
        img = img.resize((int(img.width * factor), int(img.height * factor)), Image.Resampling.LANCZOS)
    contrast = ImageEnhance.Contrast(img)
    img = contrast.enhance(3.0)
    img = img.filter(ImageFilter.MedianFilter(size=3))
    img = img.filter(ImageFilter.SHARPEN)
    img = img.point(lambda x: 0 if x < 140 else 255, '1')
    return img

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/check', methods=['POST'])
def check_image():
    data = request.get_json()
    if 'image' not in data:
        return jsonify({"error": "❌ No image data provided."}), 400

    try:
        image_data = data['image'].split(',')[1]
        image_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        return jsonify({"error": f"Invalid image data: {str(e)}"}), 400

    img = preprocess_image(img)
    custom_config = r'--oem 3 --psm 6'
    raw_text = pytesseract.image_to_string(img, config=custom_config)
    cleaned_text = raw_text.replace('\n', ' ').replace('\r', '').lower()

    print("\n--- OCR TEXT ---\n", cleaned_text, "\n----------------\n")

    words = cleaned_text.strip().split()
    valid_word_count = sum(1 for word in words if len(word) > 2 and word.isalpha())
    if valid_word_count < 5:
        return jsonify({
            "error": "❌ Image is too blurry or unclear to extract valid ingredients. Please upload a clearer label image or try another one."
        }), 400

    merged_results = {}

    for entry in harmful_ingredients:
        name = entry["ingredient"]
        aliases = [name.lower()] + [alias.lower() for alias in entry.get("aliases", [])]
        for term in aliases:
            pattern = r'\b' + re.escape(term) + r'\b'
            if re.search(pattern, cleaned_text):
                key = name.lower()
                if key not in merged_results:
                    merged_results[key] = {
                        "ingredient": name,
                        "reason": entry.get("reason", []),
                        "risk_level": entry.get("risk_level", "Low"),
                        "health_risks": entry.get("health_risks", []),
                        "banned_in": entry.get("banned_in", [])
                    }
                else:
                    existing = merged_results[key]
                    old_reason = existing["reason"] if isinstance(existing["reason"], list) else [existing["reason"]]
                    new_reason = entry["reason"] if isinstance(entry["reason"], list) else [entry["reason"]]
                    existing["reason"] = list(set(old_reason + new_reason))
                    existing["health_risks"] = list(set(existing["health_risks"] + entry.get("health_risks", [])))
                    existing["banned_in"] = list(set(existing["banned_in"] + entry.get("banned_in", [])))
                    if risk_rank.get(entry.get("risk_level", "Low"), 1) > risk_rank.get(existing["risk_level"], 1):
                        existing["risk_level"] = entry.get("risk_level")
                break

    if merged_results:
        return jsonify({
            "harmful_found": list(merged_results.values()),
            "safe": False,
            "message": f"⚠️ Found {len(merged_results)} harmful ingredient(s)."
        })

    return jsonify({
        "harmful_found": [],
        "safe": True,
        "message": "✅ No harmful ingredients found. Product appears to be safe."
    })

if __name__ == '__main__':
    app.run(debug=True)