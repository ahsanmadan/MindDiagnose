import uuid
from django.db import models

class Disease(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    max_weight = models.IntegerField(help_text="Total maximum weight of all symptoms for this disease")
    confidence_threshold = models.DecimalField(max_digits=5, decimal_places=2, help_text="Threshold percentage (e.g., 35.00 for 35%)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.code}] {self.name}"

class Symptom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"[{self.code}] {self.name}"

class KnowledgeBase(models.Model):
    TYPE_CHOICES = (
        ('utama', 'Utama'),
        ('pendukung', 'Pendukung'),
        ('ringan', 'Ringan'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    disease = models.ForeignKey(Disease, related_name='rules', on_delete=models.CASCADE)
    symptom = models.ForeignKey(Symptom, related_name='disease_rules', on_delete=models.CASCADE)
    weight = models.IntegerField(help_text="Weight of the symptom for this disease (1-10)")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='utama')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('disease', 'symptom')

    def __str__(self):
        return f"{self.disease.code} - {self.symptom.code} ({self.weight})"

class Consultation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(blank=True, null=True, help_text="Optional User ID for anonymous consultations")
    result_disease = models.ForeignKey(Disease, null=True, blank=True, on_delete=models.SET_NULL)
    highest_confidence = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Highest confidence score obtained")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.id)

class ConsultationSymptom(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.ForeignKey(Consultation, related_name='symptoms_selected', on_delete=models.CASCADE)
    symptom = models.ForeignKey(Symptom, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('consultation', 'symptom')

    def __str__(self):
        return f"{self.consultation.id} - {self.symptom.code}"
