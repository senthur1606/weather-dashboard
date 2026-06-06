from django.contrib import admin
from django.utils.html import format_html
from .models import FavoriteCity, WeatherAlert, WeatherSnapshot


@admin.register(FavoriteCity)
class FavoriteCityAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'country', 'lat', 'lon', 'created_at']
    list_filter = ['country', 'created_at']
    search_fields = ['user__username', 'city', 'country']
    date_hierarchy = 'created_at'


@admin.register(WeatherAlert)
class WeatherAlertAdmin(admin.ModelAdmin):
    list_display = ['city', 'title', 'severity_badge', 'is_active', 'notified', 'created_at']
    list_filter = ['severity', 'is_active', 'notified']
    search_fields = ['city', 'title']
    actions = ['mark_inactive', 'resend_notifications']

    def severity_badge(self, obj):
        colors = {
            'info': '#3b82f6',
            'warning': '#f59e0b',
            'severe': '#ef4444',
            'extreme': '#7c3aed',
        }
        color = colors.get(obj.severity, '#6b7280')
        return format_html(
            '<span style="background:{};color:white;padding:2px 8px;border-radius:4px;font-size:11px">{}</span>',
            color, obj.severity.upper()
        )
    severity_badge.short_description = 'Severity'

    def mark_inactive(self, request, queryset):
        queryset.update(is_active=False)
    mark_inactive.short_description = 'Mark selected alerts as inactive'

    def resend_notifications(self, request, queryset):
        queryset.update(notified=False)
    resend_notifications.short_description = 'Queue for re-notification'


@admin.register(WeatherSnapshot)
class WeatherSnapshotAdmin(admin.ModelAdmin):
    list_display = ['city', 'country', 'temperature', 'humidity', 'condition', 'recorded_at']
    list_filter = ['country', 'condition', 'recorded_at']
    search_fields = ['city', 'country']
    date_hierarchy = 'recorded_at'
    readonly_fields = ['recorded_at']


# Customise admin site branding
admin.site.site_header = '☁️ SkyPulse Weather Dashboard'
admin.site.site_title = 'SkyPulse Admin'
admin.site.index_title = 'Dashboard'
