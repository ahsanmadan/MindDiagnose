"""
engine.py — Weighted Scoring Expert System Engine
Membaca datasetUTS.xlsx sekali saat startup, menyimpan semua data di memory.
Tidak perlu database, tidak perlu ORM.
"""

import re
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATASET_PATH = BASE_DIR / "datasetUTS.xlsx"

# ── In-memory knowledge base ──────────────────────────────────────────────────
diseases   = {}   # { code: {code, name, description, max_weight, threshold} }
symptoms   = {}   # { code: {code, name, category, description} }
rules      = {}   # { disease_code: [ {symptom_code, weight, type} ] }
sym_by_idx = []   # list of symptom dicts, ordered for search

def _parse_symptom_cell(cell_val, disease_code, sym_type):
    """Parse 'G01(9), G02(8)' style cell and append to rules."""
    if pd.isna(cell_val):
        return
    for item in str(cell_val).split(','):
        item = item.strip()
        m = re.search(r'(G\d+)\((\d+)\)', item)
        if m:
            sym_code = m.group(1)
            weight   = int(m.group(2))
            rules.setdefault(disease_code, []).append({
                "symptom_code": sym_code,
                "weight": weight,
                "type": sym_type,
            })

def load_knowledge_base():
    """Load Excel once at startup into module-level dicts."""
    global sym_by_idx
    xl = pd.ExcelFile(DATASET_PATH)

    # 1. Diseases
    for _, row in xl.parse('A. Tabel Penyakit').iterrows():
        code = str(row['Kode']).strip()
        diseases[code] = {
            "code": code,
            "name": str(row['Nama Penyakit']).strip(),
            "description": str(row['Deskripsi Penyakit']).strip() if pd.notna(row['Deskripsi Penyakit']) else "",
            "max_weight": 0,
            "threshold": 0.0,
        }

    # 2. Symptoms
    for _, row in xl.parse('B. Tabel Gejala').iterrows():
        code = str(row['Kode']).strip()
        symptoms[code] = {
            "code": code,
            "name": str(row['Nama Gejala']).strip(),
            "category": str(row['Kategori']).strip() if pd.notna(row['Kategori']) else "Lainnya",
            "description": str(row['Deskripsi Gejala']).strip() if pd.notna(row['Deskripsi Gejala']) else "",
        }

    # 3. Knowledge Base (rules + update disease weights/thresholds)
    for _, row in xl.parse('C. Basis Pengetahuan').iterrows():
        disease_name = str(row['Penyakit']).strip()
        # match by name
        matched_code = next(
            (c for c, d in diseases.items() if d['name'].lower() == disease_name.lower()),
            None
        )
        if not matched_code:
            continue

        # Update threshold & max_weight on disease
        try:
            threshold = float(str(row['Confidence Threshold']).replace('%', '').strip())
        except (ValueError, AttributeError):
            threshold = 0.0

        diseases[matched_code]['max_weight'] = int(row['Total Bobot Max'])
        diseases[matched_code]['threshold']  = threshold

        _parse_symptom_cell(row['Gejala Utama (Bobot 8-10)'],    matched_code, 'utama')
        _parse_symptom_cell(row['Gejala Pendukung (Bobot 4-7)'], matched_code, 'pendukung')
        _parse_symptom_cell(row['Gejala Ringan (Bobot 1-3)'],    matched_code, 'ringan')

    sym_by_idx = list(symptoms.values())
    print(f"[engine] Loaded: {len(diseases)} diseases, {len(symptoms)} symptoms, "
          f"{sum(len(v) for v in rules.values())} rules")


def get_symptoms_grouped():
    """Return symptoms grouped by category, for the search endpoint."""
    grouped = {}
    for s in symptoms.values():
        cat = s['category'] or "Lainnya"
        grouped.setdefault(cat, []).append(s)
    return [{"category": k, "symptoms": v} for k, v in sorted(grouped.items())]


def diagnose(selected_codes: list[str]) -> dict:
    """
    Weighted Scoring inference engine.
    selected_codes: list of symptom codes chosen by user (e.g. ['G01','G05']).
    Returns sorted list of disease results with score & matched symptoms.
    """
    selected_set = set(selected_codes)
    results = []

    for d_code, disease in diseases.items():
        disease_rules = rules.get(d_code, [])
        matched = [r for r in disease_rules if r['symptom_code'] in selected_set]

        if not matched:
            continue

        total_weight = sum(r['weight'] for r in matched)
        max_w = disease['max_weight'] or 1
        score = round((total_weight / max_w) * 100, 2)
        above = score >= disease['threshold']

        results.append({
            "disease": {
                "code": d_code,
                "name": disease['name'],
                "description": disease['description'],
                "threshold": disease['threshold'],
            },
            "score_percentage": score,
            "is_above_threshold": above,
            "matched_symptoms": [
                {
                    "code": r['symptom_code'],
                    "name": symptoms.get(r['symptom_code'], {}).get('name', r['symptom_code']),
                    "weight": r['weight'],
                    "type": r['type'],
                }
                for r in matched
            ],
        })

    results.sort(key=lambda x: x['score_percentage'], reverse=True)
    return results
