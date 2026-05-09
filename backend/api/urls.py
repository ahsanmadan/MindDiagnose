from django.urls import path
from .views import SymptomListView, DiagnoseView

urlpatterns = [
    path('symptoms/', SymptomListView.as_view(), name='symptoms-list'),
    path('diagnose/', DiagnoseView.as_view(), name='diagnose'),
]
