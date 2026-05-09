from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from .models import Disease, Symptom, KnowledgeBase, Consultation, ConsultationSymptom
from .serializers import SymptomSerializer, DiagnosisRequestSerializer

class SymptomListView(APIView):
    def get(self, request):
        symptoms = Symptom.objects.all().order_by('category', 'code')
        
        # Group by category
        grouped_data = {}
        for sym in symptoms:
            cat = sym.category or "Lainnya"
            if cat not in grouped_data:
                grouped_data[cat] = []
            
            grouped_data[cat].append({
                "id": str(sym.id),
                "code": sym.code,
                "name": sym.name,
                "description": sym.description
            })
            
        result = [{"category": k, "symptoms": v} for k, v in grouped_data.items()]
        
        return Response({
            "status": "success",
            "data": result
        })

class DiagnoseView(APIView):
    def post(self, request):
        serializer = DiagnosisRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"status": "error", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        symptom_ids = serializer.validated_data['symptom_ids']
        
        # Calculate scores for all diseases
        diseases = Disease.objects.all()
        results = []
        
        highest_score = 0
        best_disease = None

        for disease in diseases:
            # Get rules for this disease that match the input symptoms
            matching_rules = KnowledgeBase.objects.filter(
                disease=disease, 
                symptom_id__in=symptom_ids
            )
            
            total_weight_matched = matching_rules.aggregate(Sum('weight'))['weight__sum'] or 0
            
            if disease.max_weight > 0:
                score_percentage = round((total_weight_matched / disease.max_weight) * 100, 2)
            else:
                score_percentage = 0.0
                
            is_above_threshold = score_percentage >= float(disease.confidence_threshold)
            
            if is_above_threshold and score_percentage > highest_score:
                highest_score = score_percentage
                best_disease = disease
                
            # Prepare match detail
            matched_symptoms = []
            for rule in matching_rules:
                matched_symptoms.append({
                    "code": rule.symptom.code,
                    "name": rule.symptom.name,
                    "weight": rule.weight,
                    "type": rule.type
                })
                
            if total_weight_matched > 0:
                results.append({
                    "disease": {
                        "id": str(disease.id),
                        "code": disease.code,
                        "name": disease.name,
                        "threshold": float(disease.confidence_threshold)
                    },
                    "score_percentage": float(score_percentage),
                    "is_above_threshold": is_above_threshold,
                    "matched_symptoms": matched_symptoms
                })
                
        # Sort results by score descending
        results.sort(key=lambda x: x['score_percentage'], reverse=True)
        
        # Save consultation
        consultation = Consultation.objects.create(
            result_disease=best_disease,
            highest_confidence=highest_score
        )
        
        # Save consultation symptoms
        for sym_id in symptom_ids:
            try:
                symptom_obj = Symptom.objects.get(id=sym_id)
                ConsultationSymptom.objects.create(
                    consultation=consultation,
                    symptom=symptom_obj
                )
            except Symptom.DoesNotExist:
                continue
                
        return Response({
            "status": "success",
            "data": {
                "consultation_id": str(consultation.id),
                "results": results
            }
        })
