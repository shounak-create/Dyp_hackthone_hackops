from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView


urlpatterns = [
    path('signup/', views.signup),
    path('login/', views.login),

    path('analysis/create/', views.create_analysis),
    path('analysis/<int:user_id>/', views.get_user_analyses),
    path('audit/', views.generate_career_audit, name='career-audit'),
]