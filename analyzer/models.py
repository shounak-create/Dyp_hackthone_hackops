from django.db import models

# Create your models here.

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin



# ============================
# 👤 Custom User Manager
# ============================
class CustomUserManager(BaseUserManager):

    def create_user(self, email, username, password=None):
        if not email:
            raise ValueError("Email is required")

        if not username:
            raise ValueError("Username is required")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            username=username,
        )

        user.set_password(password)  # 🔐 Hash password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password):
        user = self.create_user(email, username, password)

        user.is_staff = True
        user.is_superuser = True
        user.is_active = True

        user.save(using=self._db)
        return user


# ============================
# 👤 Custom User Model (Auth)
# ============================
class CustomUser(AbstractBaseUser, PermissionsMixin):

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=50, unique=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


# ============================
# 👤 Developer (GitHub Data)
# ============================
class Developer(models.Model):
    user = models.OneToOneField(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="developer_profile",
        null=True,
        blank=True
    )

    github_username = models.CharField(max_length=100, unique=True)
    github_id = models.CharField(max_length=100, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.github_username


# ============================
# 📊 Analysis Data Model
# ============================
class DeveloperAnalysis(models.Model):
    developer = models.ForeignKey(
        Developer,
        on_delete=models.CASCADE,
        related_name="analyses"
    )

    score = models.IntegerField()
    level = models.CharField(max_length=50)

    ai_feedback = models.TextField()
    roadmap_90_days = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.developer.github_username} - {self.level}"

# ============================
# 🧠 User Analysis Model (AI Data)
# ============================
class UserAnalysis(models.Model):
    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name="analyses"
    )

    summary = models.TextField()
    skill_gaps = models.TextField()
    roadmap = models.TextField()

    estimated_level = models.CharField(max_length=50)
    score = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.estimated_level}"