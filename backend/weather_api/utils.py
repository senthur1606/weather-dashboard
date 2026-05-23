"""
Shared utility functions for the weather_api app.
"""
import logging
from io import BytesIO
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger('weather_api')


# ─── Response Helpers ─────────────────────────────────────────────────────────

def success_response(data, status=200):
    return Response(data, status=status)


def error_response(message: str, status: int = 400):
    return Response({'error': message}, status=status)


def custom_exception_handler(exc, context):
    """Centralised DRF exception handler with consistent JSON error format."""
    response = exception_handler(exc, context)

    if response is not None:
        detail = response.data
        if isinstance(detail, dict) and 'detail' in detail:
            detail = str(detail['detail'])
        elif isinstance(detail, list):
            detail = detail[0] if detail else 'An error occurred.'

        response.data = {
            'error': str(detail),
            'status_code': response.status_code,
        }

    return response


# ─── PDF Export ───────────────────────────────────────────────────────────────

def generate_weather_pdf(city: str, current: dict, forecast: dict) -> bytes:
    """
    Generate a simple weather report PDF using ReportLab.
    Returns raw PDF bytes.
    """
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.units import cm
        from datetime import datetime

        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=2*cm, bottomMargin=2*cm,
                                leftMargin=2*cm, rightMargin=2*cm)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle('title', parent=styles['Title'],
                                     fontSize=24, textColor=colors.HexColor('#0c4a6e'),
                                     spaceAfter=12)
        heading_style = ParagraphStyle('heading', parent=styles['Heading2'],
                                       fontSize=14, textColor=colors.HexColor('#0284c7'),
                                       spaceAfter=8, spaceBefore=16)
        body_style = styles['Normal']

        story = []

        # Title
        story.append(Paragraph(f'SkyPulse Weather Report', title_style))
        story.append(Paragraph(f'City: {city} | Generated: {datetime.now().strftime("%B %d, %Y %H:%M UTC")}',
                               body_style))
        story.append(Spacer(1, 0.5*cm))

        # Current conditions
        story.append(Paragraph('Current Conditions', heading_style))

        current_data = [
            ['Metric', 'Value'],
            ['Temperature', f"{current.get('temperature', '—')}°C (Feels like {current.get('feels_like', '—')}°C)"],
            ['Condition', current.get('condition', '—')],
            ['Humidity', f"{current.get('humidity', '—')}%"],
            ['Wind Speed', f"{current.get('wind_speed', '—')} km/h"],
            ['Pressure', f"{current.get('pressure', '—')} hPa"],
            ['Visibility', f"{current.get('visibility', '—')} km"],
            ['UV Index', str(current.get('uv_index', '—'))],
            ['Sunrise', current.get('sunrise', '—')],
            ['Sunset', current.get('sunset', '—')],
        ]

        table = Table(current_data, colWidths=[6*cm, 10*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0c4a6e')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f9ff')]),
            ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(table)

        # 7-Day Forecast
        if forecast and forecast.get('daily'):
            story.append(Paragraph('7-Day Forecast', heading_style))
            forecast_data = [['Day', 'High', 'Low', 'Condition', 'Rain %']]
            for day in forecast['daily']:
                forecast_data.append([
                    day.get('day', '—'),
                    f"{day.get('high', '—')}°C",
                    f"{day.get('low', '—')}°C",
                    day.get('condition', '—'),
                    f"{day.get('precipitation', 0)}%",
                ])

            ftable = Table(forecast_data, colWidths=[3*cm, 3*cm, 3*cm, 5*cm, 3*cm])
            ftable.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284c7')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f0f9ff')]),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            story.append(ftable)

        # Footer
        story.append(Spacer(1, 1*cm))
        story.append(Paragraph('Generated by SkyPulse Weather Dashboard — skypulse.app', body_style))

        doc.build(story)
        return buffer.getvalue()

    except ImportError:
        # ReportLab not available, return simple text as bytes
        content = f"SkyPulse Weather Report\n{'='*40}\n"
        content += f"City: {city}\n"
        content += f"Temperature: {current.get('temperature', '—')}°C\n"
        content += f"Condition: {current.get('condition', '—')}\n"
        return content.encode('utf-8')


# ─── Cache Utilities ──────────────────────────────────────────────────────────

def clear_city_cache(city: str):
    """Clear all cached data for a given city."""
    from django.core.cache import cache
    prefixes = ['current', 'forecast', 'aqi', 'geo', 'search']
    for prefix in prefixes:
        key = f"skypulse_{prefix}_{city.lower().replace(' ', '_')}"
        cache.delete(key)
    logger.info(f"Cleared cache for {city}")


# ─── Severity Helpers ─────────────────────────────────────────────────────────

def get_alert_severity(condition: str, wind_speed: float = 0, temp: float = 20) -> str:
    c = condition.lower()
    if 'tornado' in c or 'hurricane' in c or wind_speed > 100:
        return 'extreme'
    if 'thunderstorm' in c or 'blizzard' in c or wind_speed > 60 or temp < -20 or temp > 45:
        return 'severe'
    if 'storm' in c or 'heavy rain' in c or wind_speed > 40:
        return 'warning'
    return 'info'
