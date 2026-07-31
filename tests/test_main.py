import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    """Verifica que la ruta principal esté online."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "online", "message": "API de Acortador de URLs activa"}

def test_create_and_fetch_url():
    """Prueba el flujo completo: acortar una URL y luego consultar sus analíticas."""
    test_url = "https://github.com/UserDAVIDGAR03"
    
    # 1. Crear URL corta (enviando original_url como lo espera schemas.py)
    response = client.post("/api/shorten", json={"original_url": test_url})
    assert response.status_code == 201
    data = response.json()
    assert "short_id" in data
    assert data["original_url"] == test_url
    
    short_id = data["short_id"]
    
    # 2. Consultar analíticas
    analytics_resp = client.get(f"/api/analytics/{short_id}")
    assert analytics_resp.status_code == 200
    assert analytics_resp.json()["short_id"] == short_id

def test_nonexistent_url_analytics():
    """Verifica que buscar un código inexistente devuelva un 404."""
    response = client.get("/api/analytics/codigo_falso_123")
    assert response.status_code == 404