# admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import CustomUser, Developer, DeveloperAnalysis, UserAnalysis


# ============================
# 👤 Custom User Admin
# ============================
@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'email', 'username', 'is_staff', 'is_active', 'date_joined')
    search_fields = ('email', 'username')
    list_filter = ('is_staff', 'is_active', 'date_joined')
    ordering = ('-date_joined',)


# ============================
# 📊 Developer Analysis Inline (🔥 Pro Feature)
# ============================
class DeveloperAnalysisInline(admin.TabularInline):
    model = DeveloperAnalysis
    extra = 0
    readonly_fields = ('score', 'level', 'created_at')


# ============================
# 👨‍💻 Developer Admin
# ============================
@admin.register(Developer)
class DeveloperAdmin(admin.ModelAdmin):
    list_display = ('id', 'github_username', 'github_id', 'user', 'created_at')
    search_fields = ('github_username', 'github_id', 'user__email')
    list_filter = ('created_at',)
    ordering = ('-created_at',)

    inlines = [DeveloperAnalysisInline]  # 🔥 shows analyses inside developer


# ============================
# 📊 Developer Analysis Admin
# ============================
@admin.register(DeveloperAnalysis)
class DeveloperAnalysisAdmin(admin.ModelAdmin):
    list_display = ('id', 'developer', 'score', 'level', 'created_at')
    search_fields = ('developer__github_username', 'level')
    list_filter = ('level', 'created_at')
    ordering = ('-created_at',)

    readonly_fields = ('formatted_feedback', 'formatted_roadmap')

    def formatted_feedback(self, obj):
        return format_html("<pre>{}</pre>", obj.ai_feedback)

    def formatted_roadmap(self, obj):
        return format_html("<pre>{}</pre>", obj.roadmap_90_days)

    formatted_feedback.short_description = "AI Feedback"
    formatted_roadmap.short_description = "90-Day Roadmap"


# ============================
# 🧠 User Analysis Admin
# ============================
@admin.register(UserAnalysis)
class UserAnalysisAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'estimated_level', 'score', 'created_at')
    search_fields = ('user__email', 'estimated_level')
    list_filter = ('estimated_level', 'created_at')
    ordering = ('-created_at',)

    readonly_fields = ('formatted_summary', 'formatted_skill_gaps', 'formatted_roadmap')

    def formatted_summary(self, obj):
        return format_html("<pre>{}</pre>", obj.summary)

    def formatted_skill_gaps(self, obj):
        return format_html("<pre>{}</pre>", obj.skill_gaps)

    def formatted_roadmap(self, obj):
        return format_html("<pre>{}</pre>", obj.roadmap)

    formatted_summary.short_description = "Summary"
    formatted_skill_gaps.short_description = "Skill Gaps"
    formatted_roadmap.short_description = "Roadmap"