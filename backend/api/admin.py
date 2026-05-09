from django.contrib import admin
from .models import Disease, Symptom, KnowledgeBase, Consultation, ConsultationSymptom

@admin.register(Disease)
class DiseaseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'max_weight', 'confidence_threshold')
    search_fields = ('code', 'name')

@admin.register(Symptom)
class SymptomAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'category')
    search_fields = ('code', 'name', 'category')
    list_filter = ('category',)

@admin.register(KnowledgeBase)
class KnowledgeBaseAdmin(admin.ModelAdmin):
    list_display = ('disease', 'symptom', 'weight', 'type')
    list_filter = ('disease', 'type')
    search_fields = ('disease__name', 'symptom__name')

class ConsultationSymptomInline(admin.TabularInline):
    model = ConsultationSymptom
    extra = 0

@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('id', 'result_disease', 'highest_confidence', 'created_at')
    list_filter = ('result_disease',)
    inlines = [ConsultationSymptomInline]
