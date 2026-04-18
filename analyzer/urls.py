from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView


urlpatterns = [
    # path('register/', views.register_user),
    # path('login/', TokenObtainPairView.as_view()),
    path('audit/', views.generate_career_audit, name='career-audit'),
]