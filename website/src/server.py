from flask import Flask, request, jsonify
import openai
from flask_cors import CORS
import pdfplumber

app = Flask(__name__)

CORS(app)  # This will allow CORS for all origins


@app.route("/upload", methods=["POST"])
def upload_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    text = ""

    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"

    return jsonify({"text": text})

@app.route("/generate-questions", methods=["POST"])
def generate_questions():
    data = request.json
    text = data.get("text", "")

    if not text:
        return jsonify({"error": "No text provided"}), 400

    prompt = f"Generate 5 study questions from this text:\n{text}\nQuestions:"
    
    try:
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        questions = response["choices"][0]["message"]["content"].strip().split("\n")
        return jsonify({"questions": questions})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)  # ✅ Ensures Flask is accessible
