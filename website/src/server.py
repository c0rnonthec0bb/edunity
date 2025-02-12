from flask import Flask, request, jsonify
import openai
from flask_cors import CORS
import pdfplumber
import json
import os

# Configure OpenAI API key
openai.api_key = os.getenv('OPENAI_API_KEY')

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

    prompt = f"""
Analyze this text and generate 5 quiz questions. For each question:
1. Create a clear, specific question that tests understanding
2. Provide the correct answer
3. Assign points (1-5) based on question difficulty

Format each question as JSON with these fields:
- question: the question text
- answer: the correct answer
- points: points value (1-5)

Text to analyze:
{text}

Generate the questions in a JSON array format.
"""
    
    try:
        response = openai.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a skilled educator who creates clear, specific quiz questions. Always respond with valid JSON array of questions."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result = response.choices[0].message.content
        questions = json.loads(result)["questions"]
        
        # Validate and clean up questions
        validated_questions = []
        for q in questions:
            if all(k in q for k in ["question", "answer", "points"]):
                # Ensure points are between 1 and 5
                q["points"] = max(1, min(5, int(q["points"])))
                validated_questions.append(q)
        
        return jsonify({"questions": validated_questions})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)  # ✅ Ensures Flask is accessible
