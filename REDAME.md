# 🚀 Acortador de URLs API

Una API RESTful robusta y de alto rendimiento diseñada para acortar enlaces largos y registrar analíticas de clics en tiempo real. 

Este proyecto fue construido desde cero aplicando buenas prácticas de ingeniería de software, validación estricta de datos, separación de responsabilidades y un ORM para la gestión de la base de datos.

---

## 🛠️ Tecnologías y Herramientas

* **Framework Core:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
* **Servidor Web:** Uvicorn
* **Base de Datos & ORM:** SQLite (Desarrollo) / SQLAlchemy
* **Validación de Datos:** Pydantic
* **Control de Entorno:** python-dotenv

---

## ⚙️ Características Principales

* **Generación de Enlaces Cortos:** Convierte URLs largas en identificadores únicos de 6 caracteres.
* **Redirección Rápida:** Búsqueda optimizada en base de datos para redirigir al usuario al instante.
* **Analítica Integrada:** Sistema de seguimiento que cuenta automáticamente cuántas veces se hace clic en cada enlace generado.
* **Validación Automática:** Rechaza peticiones con URLs malformadas gracias a la integración nativa de Pydantic.
* **Documentación Interactiva:** Interfaz Swagger UI generada automáticamente para probar los endpoints sin necesidad de Postman.

---

## 💻 Instalación y Ejecución Local

Si deseas correr este proyecto en tu propia máquina, sigue estos pasos:

**1. Clonar el repositorio**
```bash
git clone [https://github.com/UserDAVIDGAR03/fastapi-url-shortener.git](https://github.com/UserDAVIDGAR03/fastapi-url-shortener.git)
cd fastapi-url-shortener