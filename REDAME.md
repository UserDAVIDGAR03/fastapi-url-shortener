# Acortador de URLs API

Una API RESTful robusta y de alto rendimiento diseñada para acortar enlaces largos y registrar analíticas de clics en tiempo real. 

Este proyecto fue construido desde cero aplicando buenas prácticas de ingeniería de software, validación estricta de datos, separación de responsabilidades y un ORM para la gestión de la base de datos.

---

## Tecnologías y Herramientas

* **Framework Core:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
* **Servidor Web:** Uvicorn
* **Base de Datos & ORM:** SQLite (Desarrollo) / SQLAlchemy
* **Validación de Datos:** Pydantic
* **Control de Entorno:** python-dotenv

---

## Características Principales

* **Generación de Enlaces Cortos:** Convierte URLs largas en identificadores únicos de 6 caracteres.
* **Redirección Rápida:** Búsqueda optimizada en base de datos para redirigir al usuario al instante.
* **Analítica Integrada:** Sistema de seguimiento que cuenta automáticamente cuántas veces se hace clic en cada enlace generado.
* **Validación Automática:** Rechaza peticiones con URLs malformadas gracias a la integración nativa de Pydantic.
* **Documentación Interactiva:** Interfaz Swagger UI generada automáticamente para probar los endpoints sin necesidad de Postman.

---

## Instalación y Ejecución Local

Si deseas correr este proyecto en tu propia máquina, sigue estos pasos:

**1. Clonar el repositorio**
```bash
git clone [https://github.com/UserDAVIDGAR03/fastapi-url-shortener.git](https://github.com/UserDAVIDGAR03/fastapi-url-shortener.git)
cd fastapi-url-shortener

## ¿Cómo funciona internamente?

Esta API utiliza una arquitectura basada en rutas y servicios conectados a una base de datos relacional para gestionar el ciclo de vida de los enlaces:

1. **Creación (POST):** Cuando el usuario envía una URL larga, la API utiliza la librería `uuid` para generar un hash único de 6 caracteres. Antes de guardarlo, verifica en la base de datos que este ID no exista (previniendo colisiones). Luego, guarda el registro y devuelve el enlace acortado.
2. **Redirección (GET):** Cuando alguien visita el enlace corto, la API extrae el ID de la ruta, lo busca en la base de datos y, si existe, suma `+1` al contador de analíticas (`clicks`) antes de devolver una respuesta HTTP `307 Temporary Redirect` hacia la página original.

---

## Guía de Uso y Ejemplos

Puedes interactuar con la API directamente desde la interfaz de Swagger (`http://localhost:8000/docs`) o utilizando herramientas como `curl` o integrándola en el frontend.

### 1. Acortar un enlace
**Petición (Ejemplo con cURL):**
```bash
curl -X 'POST' \
  'http://localhost:8000/api/shorten' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "original_url": "[https://www.ejemplo.com/un-articulo-muy-largo](https://www.ejemplo.com/un-articulo-muy-largo)"
}'