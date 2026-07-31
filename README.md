# ⚡ High-Performance URL Shortener & Analytics API

[![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11%2B-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Redis](https://img.shields.io/badge/Redis-Cache-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=flat&logo=github-actions&logoColor=white)](https://github.com/features/actions)

Una API de acortamiento de URLs de alto rendimiento desarrollada con **FastAPI**, diseñada con una arquitectura limpia, manejo de caché ultrarrápido con **Redis**, procesamiento asíncrono en segundo plano, control de tráfico (*Rate Limiting*) y un conjunto robusto de pruebas automatizadas.

---

## 🏛️ Arquitectura y Características Técnicas

* **Framework Web:** FastAPI (asíncrono, validación estricta con Pydantic v2).
* **Caché & Rendimiento:** Redis para resolución instantánea de redirecciones y mitigación de carga en base de datos.
* **Procesamiento Asíncrono:** Uso de `BackgroundTasks` para registrar analíticas de clics sin bloquear las respuestas HTTP.
* **Seguridad & Rate Limiting:** Protección contra abuso de peticiones mediante `slowapi`.
* **Persistencia:** SQLAlchemy ORM con SQLite (preparado para migración a PostgreSQL).
* **Testing Automatizado:** Pruebas unitarias integradas con `pytest` y `TestClient`.
* **Containerización:** Orquestación completa mediante Docker y Docker Compose.

---

## 📂 Estructura del Proyecto

```text
fast-url-shortener/
├── app/
│   ├── __init__.py
│   ├── database.py       # Configuración de SQLAlchemy y conexión SQLite
│   ├── main.py           # Instancia principal de FastAPI y Middleware de Rate Limit
│   ├── models.py         # Modelos ORM de la base de datos
│   ├── routes.py         # Endpoints de acortamiento, redirección y analíticas
│   └── schemas.py        # Esquemas de validación y serialización Pydantic
├── tests/
│   ├── __init__.py
│   └── test_main.py      # Suite de pruebas unitarias con Pytest
├── Dockerfile            # Imagen optimizada para la API
├── docker-compose.yml    # Orquestación de servicios (API + Redis)
├── requirements.txt      # Dependencias del proyecto
└── README.md