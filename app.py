"""
app.py — MindDiagnose Flask Application
Single-file backend. Serves HTML templates + JSON API.
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import engine

app = Flask(__name__)
CORS(app)

# Load knowledge base once at startup
engine.load_knowledge_base()


# ── Pages ─────────────────────────────────────────────────────────────────────

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/assessment')
def assessment():
    return render_template('assessment.html')


# ── API ───────────────────────────────────────────────────────────────────────

@app.route('/api/symptoms')
def api_symptoms():
    """Return all symptoms grouped by category."""
    return jsonify({
        "status": "success",
        "data": engine.get_symptoms_grouped()
    })


@app.route('/api/diagnose', methods=['POST'])
def api_diagnose():
    """Accept list of symptom codes, return weighted scoring results."""
    body = request.get_json(silent=True) or {}
    selected_codes = body.get('symptom_codes', [])

    if not isinstance(selected_codes, list) or len(selected_codes) < 3:
        return jsonify({
            "status": "error",
            "message": "Pilih minimal 3 gejala untuk mendapatkan hasil diagnosa yang valid."
        }), 400

    results = engine.diagnose(selected_codes)
    return jsonify({
        "status": "success",
        "data": {
            "results": results,
            "total_analyzed": len(engine.diseases),
            "symptoms_selected": len(selected_codes),
        }
    })


@app.route('/api/symptoms/all')
def api_symptoms_flat():
    """Return flat list of all symptoms (for JS fuzzy search init)."""
    return jsonify({
        "status": "success",
        "data": list(engine.symptoms.values())
    })


# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    app.run(debug=True, port=5000)
