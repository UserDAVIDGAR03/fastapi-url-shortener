# Fast URL Shortener

Una API de acortamiento de URLs de alto rendimiento lista para producción, construida con **FastAPI**, **PostgreSQL** y **Redis**, completamente contenerizada mediante **Docker Compose**.

---

## 📋 Problema Resuelto

### Desafíos Iniciales y Cuellos de Botella Arquitectónicos
Las aplicaciones tradicionales de acortamiento de URLs suelen enfrentar problemas críticos de escalabilidad y resiliencia bajo picos de tráfico:
1. **Cuellos de botella en la base de datos y latencia:** Depender exclusivamente de bases de datos basadas en archivos (como SQLite) o de configuraciones no optimizadas genera una degradación del rendimiento durante las consultas de redirección de alta concurrencia.
2. **Fallos en caché y limitación de tasa (Rate-Limiting):** Sin una capa de caché en memoria, las peticiones frecuentes de redirección saturan la base de datos principal, incrementando la latencia. Además, la ausencia de límites de tasa expone los endpoints a abusos, vectores de DDoS y escaneos de fuerza bruta.
3. **Desconexiones en la orquestación de contenedores:** Una red mal configurada entre contenedores (por ejemplo, usar hardcode de `localhost` dentro de redes de Docker en lugar de nombres DNS de servicios como `db` o `redis`) provoca fallos inmediatos de inicio y excepciones de conexión rechazada (`ConnectionRefusedError`).

### Cómo esta API satisface y corrige el error
* **Almacenamiento relacional persistente:** Migración de almacenamiento transitorio a una base de datos robusta **PostgreSQL 15** gestionada mediante SQLAlchemy ORM, garantizando conformidad ACID y durabilidad de los datos.
* **Caché en memoria y alto rendimiento:** Integración de **Redis** para almacenar en caché resoluciones frecuentes de URLs, reduciendo drásticamente la carga en la base de datos y garantizando velocidades de redirección ultrarrápidas.
* **Arquitectura de red Docker robusta:** Corrección de la comunicación interna entre contenedores mediante el mapeo de servicios en Docker Compose, previniendo errores de conexión y asegurando un handshake fluido entre FastAPI, PostgreSQL y Redis.
* **Pipeline de CI/CD automatizado:** Integración de **GitHub Actions** para ejecutar automáticamente las suites de pruebas (`pytest`) en entornos virtuales de Linux en cada `push`, asegurando integración continua y la salud del código.

---

## 🏗️ Arquitectura del Sistema

```text
       +------------------+
       |   Cliente / User |
       +--------+---------+
                | HTTP / Puerto 8000
                v
       +------------------+
       | FastAPI (Docker) |<----+
       +---+----------+---+     |
           |          |         |
    SQLAlchemy      Redis       | Búsqueda en 
           |          |         | Caché (Memoria)
           v          v         |
     +-----------+  +-----------+
     | PostgreSQL|  |   Redis   |
     | Contenedor|  | Contenedor|
     +-----------+  +-----------+
```

---

## 📂 Estructura del Proyecto

```text
fast-url-shortener/
├── .github/
│   └── workflows/
│       └── ci.yml          # Pipeline de CI/CD con GitHub Actions
├── app/
│   ├── __init__.py
│   ├── database.py         # Conexión a BD y configuración de SQLAlchemy
│   ├── main.py             # Punto de entrada de FastAPI y endpoints
│   ├── models.py           # Modelos de base de datos SQLAlchemy
│   ├── schemas.py          # Esquemas de validación de datos Pydantic
│   └── crud.py             # Operaciones de BD y lógica de negocio
├── tests/
│   ├── __init__.py
│   └── test_main.py        # Pruebas unitarias e de integración con Pytest
├── .env                    # Configuración de variables de entorno
├── Dockerfile              # Instrucciones de contenedor para FastAPI
├── docker-compose.yml      # Orquestación multi-contenedor (DB, Redis, API)
├── requirements.txt        # Dependencias de paquetes de Python
└── README.md               # Documentación del proyecto
```

---

## ⚙️ Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente en tu máquina:
* **Git** (para clonar el repositorio)
* **Python 3.11+** (para pruebas y desarrollo local)
* **Docker & Docker Compose** (para ejecución contenerizada)

---

## 🚀 Guía Paso a Paso para Probar y Ejecutar

Sigue estas instrucciones para clonar, configurar y probar el proyecto desde cero.

### Paso 1: Clonar el Repositorio
Abre tu terminal y ejecuta:
```bash
git clone <https://github.com/UserDAVIDGAR03/fastapi-url-shortener>
cd fast-url-shortener
```

### Paso 2: Configurar Variables de Entorno
Crea o verifica tu archivo `.env` en el directorio raíz. 

Para ejecutar mediante **Docker Compose**, utiliza:
```env
DATABASE_URL=postgresql://postgres:secretpassword@db:5432/url_shortener_db
BASE_URL=http://localhost:8000
REDIS_HOST=redis
REDIS_PORT=6379
```

*(Nota: Para ejecutar pruebas unitarias locales con SQLite, puedes sobrescribir o mantener dinámicamente `DATABASE_URL=sqlite:///./shortener.db`).*

---

### Paso 3: Ejecutar la Aplicación con Docker Compose

1. **Asegúrate de que Docker Desktop esté abierto y ejecutándose.**
2. **Construye y levanta todos los contenedores** (PostgreSQL, Redis y FastAPI):
   ```bash
   docker-compose up --build
   ```
3. **Verifica el estado de los contenedores** en otra ventana de terminal:
   ```bash
   docker ps
   ```
   Debes ver `postgres_db`, `redis_cache` y `fastapi_url_shortener` listados con el estado **Up**.

---

### Paso 4: Interactuar con la API (Interfaz de Swagger UI)

1. Abre tu navegador web.
2. Navega a la documentación interactiva:
   👉 **`http://localhost:8000/docs`**
3. Despliega el endpoint **`POST /api/shorten`** y haz clic en **Try it out**.
4. Envía un cuerpo de petición JSON válido:
   ```json
   {
     "original_url": "https://www.google.com"
   }
   ```
5. Haz clic en **Execute**. ¡Recibirás una respuesta **`201 Created`** con tu `short_id` único almacenado de forma persistente en PostgreSQL!

---

### Paso 5: Ejecutar Pruebas Automatizadas Localmente

Para ejecutar la suite de pruebas y verificar que todo pase correctamente:

1. Crea y activa un entorno virtual (opcional pero recomendado):
   ```bash
   python -m venv venv
   # En Windows (PowerShell):
   .\venv\Scripts\Activate
   # En macOS/Linux:
   source venv/bin/activate
   ```
2. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
3. Ejecuta pytest:
   ```bash
   python -m pytest -v
   ```

---

## 📤 Comandos para Subir a GitHub

Si realizaste cambios locales y necesitas enviar tu código a GitHub, ejecuta los siguientes comandos de forma secuencial en tu terminal:

```bash
git add .
git commit -m "docs: actualizar README completo en español y documentacion de arquitectura"
git branch -M main
git push origin main