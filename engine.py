import re
import pandas as pd
from pathlib import Path

DATASET_PATH = Path(__file__).parent / "datasetUTS.xlsx"

# data disimpan di memori waktu startup
diseases = {}
symptoms = {}
rules = {}

def _parse_gejala(cell_val, kode_penyakit, tipe):
    if pd.isna(cell_val):
        return
    for item in str(cell_val).split(','):
        item = item.strip()
        m = re.search(r'(G\d+)\((\d+)\)', item)
        if m:
            rules.setdefault(kode_penyakit, []).append({
                "symptom_code": m.group(1),
                "weight": int(m.group(2)),
                "type": tipe,
            })

def load_knowledge_base():
    xl = pd.ExcelFile(DATASET_PATH)

    # baca tabel penyakit
    for _, row in xl.parse('A. Tabel Penyakit').iterrows():
        kode = str(row['Kode']).strip()
        diseases[kode] = {
            "code": kode,
            "name": str(row['Nama Penyakit']).strip(),
            "description": str(row['Deskripsi Penyakit']).strip() if pd.notna(row['Deskripsi Penyakit']) else "",
            "max_weight": 0,
            "threshold": 0.0,
        }

    # baca tabel gejala
    for _, row in xl.parse('B. Tabel Gejala').iterrows():
        kode = str(row['Kode']).strip()
        symptoms[kode] = {
            "code": kode,
            "name": str(row['Nama Gejala']).strip(),
            "category": str(row['Kategori']).strip() if pd.notna(row['Kategori']) else "Lainnya",
            "description": str(row['Deskripsi Gejala']).strip() if pd.notna(row['Deskripsi Gejala']) else "",
        }

    # baca basis pengetahuan
    for _, row in xl.parse('C. Basis Pengetahuan').iterrows():
        nama_penyakit = str(row['Penyakit']).strip()
        kode = next(
            (c for c, d in diseases.items() if d['name'].lower() == nama_penyakit.lower()),
            None
        )
        if not kode:
            continue

        try:
            threshold = float(str(row['Confidence Threshold']).replace('%', '').strip())
        except (ValueError, AttributeError):
            threshold = 0.0

        diseases[kode]['max_weight'] = int(row['Total Bobot Max'])
        diseases[kode]['threshold'] = threshold

        _parse_gejala(row['Gejala Utama (Bobot 8-10)'], kode, 'utama')
        _parse_gejala(row['Gejala Pendukung (Bobot 4-7)'], kode, 'pendukung')
        _parse_gejala(row['Gejala Ringan (Bobot 1-3)'], kode, 'ringan')

    print(f"Data berhasil dimuat: {len(diseases)} penyakit, {len(symptoms)} gejala, {sum(len(v) for v in rules.values())} aturan")


def get_symptoms_grouped():
    grouped = {}
    for s in symptoms.values():
        cat = s['category'] or "Lainnya"
        grouped.setdefault(cat, []).append(s)
    return [{"category": k, "symptoms": v} for k, v in sorted(grouped.items())]


def diagnose(selected_codes):
    selected_set = set(selected_codes)
    hasil = []

    for kode, penyakit in diseases.items():
        aturan = rules.get(kode, [])
        cocok = [r for r in aturan if r['symptom_code'] in selected_set]

        if not cocok:
            continue

        total_bobot = sum(r['weight'] for r in cocok)
        max_w = penyakit['max_weight'] or 1
        skor = round((total_bobot / max_w) * 100, 2)
        terdeteksi = skor >= penyakit['threshold']

        hasil.append({
            "disease": {
                "code": kode,
                "name": penyakit['name'],
                "description": penyakit['description'],
                "threshold": penyakit['threshold'],
            },
            "score_percentage": skor,
            "is_above_threshold": terdeteksi,
            "matched_symptoms": [
                {
                    "code": r['symptom_code'],
                    "name": symptoms.get(r['symptom_code'], {}).get('name', r['symptom_code']),
                    "weight": r['weight'],
                    "type": r['type'],
                }
                for r in cocok
            ],
        })

    hasil.sort(key=lambda x: x['score_percentage'], reverse=True)
    return hasil
