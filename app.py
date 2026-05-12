from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import engine

app = Flask(__name__)
CORS(app)

engine.load_knowledge_base()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/assessment')
def assessment():
    return render_template('assessment.html')


@app.route('/api/symptoms')
def api_symptoms():
    return jsonify({
        "status": "success",
        "data": engine.get_symptoms_grouped()
    })


@app.route('/api/diagnose', methods=['POST'])
def api_diagnose():
    body = request.get_json(silent=True) or {}
    selected_codes = body.get('symptom_codes', [])

    if not isinstance(selected_codes, list) or len(selected_codes) < 3:
        return jsonify({
            "status": "error",
            "message": "Pilih minimal 3 gejala untuk mendapatkan hasil diagnosa yang valid."
        }), 400

    hasil = engine.diagnose(selected_codes)
    return jsonify({
        "status": "success",
        "data": {
            "results": hasil,
            "total_analyzed": len(engine.diseases),
            "symptoms_selected": len(selected_codes),
        }
    })


@app.route('/api/symptoms/all')
def api_symptoms_flat():
    return jsonify({
        "status": "success",
        "data": list(engine.symptoms.values())
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
