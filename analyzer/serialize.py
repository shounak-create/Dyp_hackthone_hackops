from rest_framework import serializers
from .models import CustomUser, UserAnalysis


# ============================
# 👤 User Serializer
# ============================
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username']


# ============================
# 🧠 User Analysis Serializer
# ============================
class UserAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAnalysis
        fields = '__all__'