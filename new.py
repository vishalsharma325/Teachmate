from flask import Flask, render_template, request, jsonify
import google.generativeai as genai

# Initialize Flask app
app = Flask(__name__, template_folder="templates", static_folder="static")

# Configure Gemini API
genai.configure(api_key="AIzaSyCXT7jyMPHY32Y7JfB5JPMLNJGIA2iivHk")

# Serve index.html
@app.route('/')
def home():
    return render_template("index.html")  # Flask will  inside the "templates/"

# Handle chatbot requests
@app.route('/ask', methods=['POST'])
def ask_gemini():
    data = request.json
    prompt = data.get("prompt", "")

    if not prompt:
        return jsonify({"error": "No prompt was provided"}), 400

    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return jsonify({"response": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run Flask app
if __name__ == "__main__":
    app.run(debug=True, port=5500)
