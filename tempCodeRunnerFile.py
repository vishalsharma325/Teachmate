from flask import Flask, request, jsonify, render_template
import google.generativeai as genai
import pymupdf as fitz
import os

app = Flask(__name__)
genai.configure(api_key="YAIzaSyCXT7jyMPHY32Y7JfB5JPMLNJGIA2iivHk")

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ask', methods=['POST'])
def ask_gemini():
    data = request.json
    prompt = data.get("prompt", "")

    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400

    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)

        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        if file.filename.endswith(".pdf"):
            extracted_text = extract_text_from_pdf(file_path)
        elif file.filename.endswith(".txt"):
            extracted_text = extract_text_from_txt(file_path)
        else:
            return jsonify({"error": "Unsupported file format"}), 400

        grading_prompt = f"Grade this document and provide feedback:\n\n{extracted_text}"
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(grading_prompt)

        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text.strip()

def extract_text_from_txt(txt_path):
    with open(txt_path, "r", encoding="utf-8") as f:
        return f.read().strip()

if __name__ == '__main__':
    app.run(debug=True)
