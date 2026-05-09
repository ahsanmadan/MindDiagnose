from rest_framework import serializers
from .models import Disease, Symptom, KnowledgeBase, Consultation, ConsultationSymptom

class SymptomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Symptom
        fields = ['id', 'code', 'name', 'category', 'description']

class DiseaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Disease
        fields = ['id', 'code', 'name', 'description', 'max_weight', 'confidence_threshold']

class ConsultationSymptomSerializer(serializers.ModelSerializer):
    symptom = SymptomSerializer()
    
    class Meta:
        model = ConsultationSymptom
        fields = ['symptom']

class ConsultationSerializer(serializers.ModelSerializer):
    result_disease = DiseaseSerializer()
    symptoms_selected = ConsultationSymptomSerializer(many=True)

    class Meta:
        model = Consultation
        fields = ['id', 'user_id', 'result_disease', 'highest_confidence', 'created_at', 'symptoms_selected']

class DiagnosisRequestSerializer(serializers.Serializer):
    symptom_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False,
        help_text="List of UUIDs of selected symptoms"
    )
