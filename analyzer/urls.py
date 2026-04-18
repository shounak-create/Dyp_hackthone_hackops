from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
     path('score/', views.skill_score),
]