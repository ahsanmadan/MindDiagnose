import os
import re
import pandas as pd
from django.core.management.base import BaseCommand
from django.conf import settings
from api.models import Disease, Symptom, KnowledgeBase

class Command(BaseCommand):
    help = 'Seed database with diseases, symptoms, and knowledge base rules from datasetUTS.xlsx'

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR.parent, 'datasetUTS.xlsx')
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Reading data from {file_path}...'))

        try:
            xl = pd.ExcelFile(file_path)
            
            # 1. Parse Diseases
            df_diseases = xl.parse('A. Tabel Penyakit')
            for _, row in df_diseases.iterrows():
                Disease.objects.update_or_create(
                    code=row['Kode'].strip(),
                    defaults={
                        'name': row['Nama Penyakit'].strip(),
                        'description': row['Deskripsi Penyakit'].strip() if pd.notna(row['Deskripsi Penyakit']) else '',
                        'max_weight': 0, # Will update from sheet C later
                        'confidence_threshold': 0.0 # Will update from sheet C later
                    }
                )
            self.stdout.write(self.style.SUCCESS('Successfully seeded Diseases.'))

            # 2. Parse Symptoms
            df_symptoms = xl.parse('B. Tabel Gejala')
            for _, row in df_symptoms.iterrows():
                Symptom.objects.update_or_create(
                    code=row['Kode'].strip(),
                    defaults={
                        'name': row['Nama Gejala'].strip(),
                        'category': row['Kategori'].strip() if pd.notna(row['Kategori']) else '',
                        'description': row['Deskripsi Gejala'].strip() if pd.notna(row['Deskripsi Gejala']) else '',
                    }
                )
            self.stdout.write(self.style.SUCCESS('Successfully seeded Symptoms.'))

            # 3. Parse Knowledge Base
            df_rules = xl.parse('C. Basis Pengetahuan')
            for _, row in df_rules.iterrows():
                disease_name = str(row['Penyakit']).strip()
                try:
                    # Some disease names might match exactly
                    disease = Disease.objects.get(name__iexact=disease_name)
                except Disease.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Disease not found by name: {disease_name}. Skipping rules for it."))
                    continue
                
                # Update max_weight and confidence_threshold
                max_w = int(row['Total Bobot Max'])
                
                # Convert threshold (e.g. "35%") to decimal
                threshold_str = str(row['Confidence Threshold']).replace('%', '').strip()
                try:
                    threshold = float(threshold_str)
                except ValueError:
                    threshold = 0.0
                
                disease.max_weight = max_w
                disease.confidence_threshold = threshold
                disease.save()

                # Process symptoms
                self._process_symptoms(row['Gejala Utama (Bobot 8-10)'], disease, 'utama')
                self._process_symptoms(row['Gejala Pendukung (Bobot 4-7)'], disease, 'pendukung')
                self._process_symptoms(row['Gejala Ringan (Bobot 1-3)'], disease, 'ringan')

            self.stdout.write(self.style.SUCCESS('Successfully seeded Knowledge Base.'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error during seeding: {str(e)}'))

    def _process_symptoms(self, cell_val, disease, sym_type):
        if pd.isna(cell_val):
            return
        
        # Expected format: G01(9), G02(9) ...
        items = str(cell_val).split(',')
        for item in items:
            item = item.strip()
            if not item:
                continue
            
            # Extract code and weight using regex
            match = re.search(r'(G\d+)\((\d+)\)', item)
            if match:
                symptom_code = match.group(1)
                weight = int(match.group(2))
                
                try:
                    symptom = Symptom.objects.get(code=symptom_code)
                    KnowledgeBase.objects.update_or_create(
                        disease=disease,
                        symptom=symptom,
                        defaults={
                            'weight': weight,
                            'type': sym_type
                        }
                    )
                except Symptom.DoesNotExist:
                    self.stdout.write(self.style.WARNING(f"Symptom code {symptom_code} not found for disease {disease.code}."))
