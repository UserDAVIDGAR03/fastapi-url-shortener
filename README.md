# Fast URL Shortener

Aplicación web Full-Stack de acortamiento de URLs de alto rendimiento lista para producción, construida con **FastAPI** (Backend), **React + Vite + Tailwind CSS** (Frontend), **PostgreSQL 15** (Base de datos) y **Redis 7** (Caché en memoria), completamente contenerizada mediante **Docker Compose** e integrada con autenticación JWT, modo invitado con límite de creación, analíticas detalladas, códigos QR descargables en PNG y soporte multi-dispositivo en red local Wi-Fi.

---

## 📋 Problema Resuelto y Características Principales

### Desafíos Resueltos
1. **Cuellos de botella en la base de datos y latencia:** Depender de bases de datos basadas en archivos (como SQLite) degrada el rendimiento en redirecciones concurrentes. Se migró a **PostgreSQL 15** mediante SQLAlchemy ORM, garantizando durabilidad y conformidad ACID.
2. **Saturación por redirecciones frecuentes:** Se integró **Redis** como capa de caché en memoria para resolver enlaces cortos frecuentes en milisegundos sin consultar PostgreSQL en cada redirección.
3. **Desconexiones entre contenedores:** Se configuró una red interna en Docker Compose donde los servicios se comunican mediante nombres de host (`db`, `redis`, `web`) y puertos aislados (`15432` externo para PostgreSQL, `8000` para Backend y `8085` para Frontend), evitando conflictos con servicios locales del equipo anfitrión.
4. **Control de acceso y experiencia multi-dispositivo:** Incluye registro e inicio de sesión con **JWT**, modo invitado identificado por `X-Guest-Id` (con límite estricto de 1 URL activa), panel de analíticas (`/api/analytics/{short_id}`), generación y descarga de códigos QR en formato PNG, y configuración mediante variables de entorno (`VITE_API_URL`) para escanear códigos QR y abrir enlaces cortos desde cualquier teléfono o dispositivo conectado a la misma red Wi-Fi.

---

## 🏗️ Arquitectura del Sistema

```text
+-----------------------------------------------------------------------+
|                   Dispositivos en la Red (PC / Móvil)                 |
+-----------------------------------+-----------------------------------+
                                    |
          +-------------------------+-------------------------+
          | HTTP :8085 (Interfaz Web)                         | HTTP :8000 (API y Redirección)
          v                                                   v
+-----------------------------------+       +-----------------------------------+
|  Frontend: react_url_shortener    |       |   Backend: fastapi_url_shortener  |
|  (React 19 + Vite + Nginx)        | ----> |   (Python 3.11 + FastAPI)         |
+-----------------------------------+  API  +-----------------+-----------------+
                                      REST                    |
                                              +---------------+---------------+
                                              |                               |
                                              v (SQLAlchemy ORM)              v (redis-py)
                                    +-------------------+           +-------------------+
                                    |  PostgreSQL 15    |           |     Redis 7       |
                                    |  (postgres_db)    |           |   (redis_cache)   |
                                    |  Puerto 15432:5432|           |   Puerto 6379     |
                                    +-------------------+           +-------------------+
```

---

## 📂 Estructura Real del Proyecto

```text
fast-url-shortener/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Pipeline de CI/CD con GitHub Actions y Pytest
├── app/                            # Código fuente del Backend (FastAPI)
│   ├── __init__.py
│   ├── auth.py                     # Hashing de contraseñas, JWT y validación de usuario/invitado
│   ├── database.py                 # Motor de conexión SQLAlchemy, SessionLocal y Base
│   ├── main.py                     # Punto de entrada FastAPI, CORS, lifespan y middlewares
│   ├── models.py                   # Modelos relacionales ORM (User, ShortURL, ClickEvent)
│   ├── routes.py                   # Endpoints REST (/auth/*, /api/shorten, /api/urls, /api/analytics/{id}, /{short_id})
│   └── schemas.py                  # Esquemas de validación de entrada/salida con Pydantic
├── frontend/                       # Código fuente del Frontend (React + Vite)
│   ├── public/                     # Recursos estáticos públicos
│   ├── src/
│   │   ├── assets/                 # Imágenes e íconos
│   │   ├── components/             # Componentes modulares de interfaz de usuario
│   │   │   ├── AnalyticsModal.jsx  # Modal de métricas y clics por enlace
│   │   │   ├── AuthView.jsx        # Vista de inicio de sesión y registro
│   │   │   ├── BlueBubblesBg.jsx   # Fondo animado para vistas de autenticación
│   │   │   ├── FlowLinesBg.jsx     # Fondo animado para la vista de bienvenida
│   │   │   ├── GreenBubblesBg.jsx  # Fondo animado temático
│   │   │   ├── Navbar.jsx          # Barra de navegación superior y estado de sesión
│   │   │   ├── QrModal.jsx         # Generador de código QR y descarga directa en PNG
│   │   │   ├── ResultCard.jsx      # Tarjeta con enlace corto generado y botón de copiado
│   │   │   ├── ShortenerForm.jsx   # Formulario para acortar nuevas URLs
│   │   │   ├── SignalWavesBg.jsx   # Fondo animado del panel principal
│   │   │   ├── StatsCards.jsx      # Tarjetas resumen de enlaces y clics totales
│   │   │   ├── UrlHistoryTable.jsx # Tabla de historial con activar/desactivar, QR, analíticas y eliminar
│   │   │   └── WelcomeView.jsx     # Pantalla inicial de bienvenida y acceso rápido/invitado
│   │   ├── services/
│   │   │   └── api.js              # Cliente Axios, interceptores JWT/X-Guest-Id y URL base
│   │   ├── App.css                 # Estilos específicos de componentes
│   │   ├── App.jsx                 # Enrutamiento de vistas y estado global de la sesión
│   │   ├── index.css               # Configuración de Tailwind CSS y estilos globales
│   │   └── main.jsx                # Punto de montaje de React en el DOM
│   ├── .env                        # Variable de entorno VITE_API_URL para red local/producción
│   ├── Dockerfile                  # Construcción multi-etapa (Node 20 Alpine -> Nginx Alpine)
│   ├── index.html                  # Plantilla HTML principal
│   └── package.json                # Dependencias y scripts de Vite/React
├── tests/                          # Pruebas automatizadas del backend
│   ├── __init__.py
│   └── test_main.py                # Suite de pruebas unitarias e integración con Pytest
├── .dockerignore                   # Exclusiones para la imagen Docker del backend
├── .gitignore                      # Archivos ignorados por Git
├── Dockerfile                      # Imagen Docker para el servidor FastAPI
├── docker-compose.yml              # Orquestación de web, frontend, db y redis
├── requirements.txt                # Dependencias de Python (FastAPI, SQLAlchemy, Redis, Pytest, etc.)
└── README.md                       # Documentación completa del proyecto
```

---

## ⚙️ Prerrequisitos

Antes de descargar y ejecutar el proyecto, asegúrate de contar con:

1. **Git:** Para clonar el repositorio ([Descargar Git](https://git-scm.com/downloads)).
2. **Docker Desktop (o Docker Engine + Docker Compose):** Indispensable para levantar los 4 servicios sin instalar bases de datos manualmente ([Descargar Docker Desktop](https://www.docker.com/products/docker-desktop/)). *Asegúrate de que Docker Desktop esté abierto y en ejecución antes de correr los comandos.*
3. **Puertos libres en tu máquina:** Verifica que los puertos `8000` (Backend), `8085` (Frontend), `15432` (PostgreSQL) y `6379` (Redis) no estén ocupados por otros programas locales.
4. **Opcional (solo si deseas correr pruebas fuera de Docker):**
   - **Python 3.11 o superior**
   - **Node.js 20 o superior**

---

## 🚀 Guía Paso a Paso de Instalación y Ejecución

### Paso 1: Clonar el Repositorio

Abre una terminal (PowerShell en Windows, Terminal en macOS/Linux) y ejecuta:

```bash
git clone [https://github.com/UserDAVIDGAR03/fastapi-url-shortener.git](https://github.com/UserDAVIDGAR03/fastapi-url-shortener.git)
cd fastapi-url-shortener
```
*(Nota: Si clonaste el repositorio con el nombre `fast-url-shortener`, entra con `cd fast-url-shortener`).*

---

### Paso 2: Configurar la Conexión del Frontend (`frontend/.env`) — **Obligatorio antes de compilar**

El backend ya viene preconfigurado en `docker-compose.yml` para conectarse automáticamente a PostgreSQL (`db:5432`) y Redis (`redis:6379`). Sin embargo, **Vite incrusta la URL del backend al momento de construir el contenedor del frontend**, por lo que debes crear `frontend/.env` **antes** de levantar Docker Compose para que los enlaces acortados y los códigos QR funcionen tanto en tu PC como al escanearlos desde tu teléfono en la misma red Wi-Fi.

1. **Elige qué URL vas a usar según cómo probarás la app:**
   - **Opción A — Solo en esta misma computadora:** Usa `http://localhost:8000`.
   - **Opción B — En esta computadora y desde tu celular/otros dispositivos en la misma red Wi-Fi (Recomendado):** Obtén tu dirección IPv4 local:
     - **En Windows (PowerShell o CMD):**
       ```powershell
       ipconfig
       ```
       Busca el apartado **Adaptador de LAN inalámbrica Wi-Fi** (o Ethernet) y copia tu `Dirección IPv4` (por ejemplo: `192.168.1.66`). *No uses direcciones de adaptadores virtuales como `172.x.x.x` (WSL/Hyper-V).*
     - **En Linux / macOS:**
       ```bash
       ip a
       # o en macOS:
       ipconfig getifaddr en0
       ```

2. **Crea el archivo `frontend/.env`:**
   Dentro de la carpeta `frontend/`, crea un archivo llamado `.env` con el siguiente contenido (reemplazando `192.168.1.66` por tu propia IPv4 local o `localhost`):
   ```env
   VITE_API_URL=[http://192.168.1.66:8000](http://192.168.1.66:8000)
   ```
   - **Comando rápido en Windows (PowerShell, desde la raíz del proyecto):**
     ```powershell
     Set-Content -Path "frontend\.env" -Value "VITE_API_URL=[http://192.168.1.66:8000](http://192.168.1.66:8000)" -Encoding utf8
     ```
   - **Comando rápido en Linux / macOS (desde la raíz del proyecto):**
     ```bash
     echo "VITE_API_URL=[http://192.168.1.66:8000](http://192.168.1.66:8000)" > frontend/.env
     ```

---

### Paso 3: Levantar Base de Datos, Redis, Backend y Frontend con Docker Compose

Con **Docker Desktop abierto**, ejecuta desde la carpeta raíz del proyecto:

```bash
docker compose up -d --build
```

#### ¿Qué hace este comando automáticamente?
1. **`postgres_db` (PostgreSQL 15):** Crea el contenedor de base de datos, inicializa la base `url_shortener_db` con usuario `postgres` y contraseña `secretpassword`, y expone el puerto `15432` en tu máquina (mapeado al `5432` interno) con almacenamiento persistente en el volumen `postgres_data`.
2. **`redis_cache` (Redis 7):** Inicia el servidor de caché en memoria en el puerto `6379`.
3. **`fastapi_url_shortener` (Backend FastAPI):** Espera a que PostgreSQL pase su *healthcheck*, crea automáticamente todas las tablas mediante SQLAlchemy al arrancar y levanta la API en el puerto **`8000`**.
4. **`react_url_shortener` (Frontend React + Nginx):** Compila la interfaz web leyendo `frontend/.env` y la sirve en el puerto **`8085`**.

#### Verificar que los 4 contenedores estén activos:
```bash
docker compose ps
```
Todos los servicios (`fastapi_url_shortener`, `react_url_shortener`, `postgres_db`, `redis_cache`) deben aparecer con estado **`Up`** (y `postgres_db` como `healthy`).

---

### Paso 4: Permitir Acceso desde Otros Dispositivos en la Red Local (Según tu Sistema Operativo)

Si configuraste tu IP local (Opción B del Paso 2) y deseas abrir la aplicación o escanear los códigos QR desde tu celular conectado a la misma red Wi-Fi, asegúrate de permitir las conexiones entrantes hacia los puertos `8000` y `8085`:

* **En Windows (PowerShell como Administrador):**
  ```powershell
  New-NetFirewallRule -DisplayName "FastURL Backend 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
  New-NetFirewallRule -DisplayName "FastURL Frontend 8085" -Direction Inbound -LocalPort 8085 -Protocol TCP -Action Allow
  ```
* **En Linux (si usas UFW):**
  ```bash
  sudo ufw allow 8000/tcp
  sudo ufw allow 8085/tcp
  ```
* **En macOS:** Normalmente no requiere configuración adicional si aceptas las conexiones entrantes para Docker cuando el sistema lo solicite.

---

## ✅ Verificación Rápida de Funcionamiento (Flujo de Prueba en 1 Minuto)

Una vez que los 4 contenedores estén en estado `Up`, realiza esta prueba rápida para confirmar que todo funciona de extremo a extremo:

1. Abre **`http://localhost:8085`** (o `http://<TU_IP_LOCAL>:8085`) en tu navegador.
2. En la pantalla inicial, elige **Continuar como invitado** (permite crear 1 enlace de prueba sin registro) o haz clic en **Crear cuenta** para registrarte e iniciar sesión con JWT sin límite de enlaces.
3. Pega una URL larga (por ejemplo, `https://www.github.com`) y presiona **Acortar**.
4. Verifica que en la tarjeta de resultado y en el historial aparezca el enlace con la URL configurada (`http://<TU_IP_LOCAL>:8000/<short_id>`).
5. Haz clic en el botón **QR** de ese enlace, escanea el código con la cámara de tu teléfono (conectado al mismo Wi-Fi) y comprueba que redirige correctamente a la página original y suma +1 clic en **Analíticas**.

---

## 🌐 Puntos de Acceso de la Aplicación

| Servicio | URL Local (Misma PC) | URL Red Local (Celular / Otros equipos) | Descripción |
| :--- | :--- | :--- | :--- |
| **Aplicación Web (Frontend)** | `http://localhost:8085` | `http://<TU_IP_LOCAL>:8085` | Interfaz visual en React para acortar URLs, ver historial, analíticas y generar QR. |
| **API Backend** | `http://localhost:8000` | `http://<TU_IP_LOCAL>:8000` | Servidor FastAPI que procesa peticiones y ejecuta las redirecciones `/{short_id}`. |
| **Documentación Swagger UI** | `http://localhost:8000/docs` | `http://<TU_IP_LOCAL>:8000/docs` | Interfaz interactiva para probar todos los endpoints REST directamente. |
| **Base de Datos PostgreSQL** | `localhost:15432` | — | Acceso externo para clientes SQL (DBeaver, pgAdmin) con usuario `postgres` y pass `secretpassword`. |

---

## 🔌 Resumen de Endpoints Principales de la API

* **`POST /auth/register`** — Registra un nuevo usuario (`email`, `password`).
* **`POST /auth/login`** — Inicia sesión y devuelve el token `access_token` (JWT Bearer).
* **`POST /api/shorten`** — Crea una URL acortada (acepta usuario autenticado vía JWT o invitado vía cabecera `X-Guest-Id` con límite de 1 enlace).
* **`GET /api/urls`** — Lista el historial de URLs pertenecientes al usuario o sesión invitada actual.
* **`PATCH /api/urls/{short_id}/toggle`** — Activa o desactiva temporalmente un enlace acortado.
* **`DELETE /api/urls/{short_id}`** — Elimina permanentemente un enlace y limpia su caché en Redis.
* **`GET /api/analytics/{short_id}`** — Obtiene estadísticas detalladas de clics, fechas y métricas del enlace.
* **`GET /{short_id}`** — Redirige (`307 Temporary Redirect`) hacia la URL original buscando primero en Redis y respaldando en PostgreSQL.

---

## 🧪 Ejecutar Pruebas Automatizadas (Pytest)

Puedes ejecutar las pruebas de dos formas:

### Opción 1: Dentro del contenedor Docker (sin instalar nada en tu PC)
Con los contenedores levantados (`docker compose up -d`), ejecuta:
```bash
docker compose exec web pytest -v
```

### Opción 2: En tu entorno local (con entorno virtual Python)
```bash
# 1. Crear y activar entorno virtual
python -m venv venv

# En Windows (PowerShell):
.\venv\Scripts\Activate

# En macOS/Linux:
source venv/bin/activate

# 2. Instalar dependencias de Python
pip install -r requirements.txt

# 3. Ejecutar pruebas con Pytest (asegúrate de tener PostgreSQL y Redis activos)
python -m pytest -v
```

---

## 🧯 Solución de Problemas Frecuentes

* **Los enlaces o códigos QR siguen mostrando `localhost` o una IP antigua:**
  1. Actualiza `frontend/.env` con tu IP actual (`VITE_API_URL=http://<TU_IP_ACTUAL>:8000`).
  2. Reconstruye el contenedor del frontend sin caché:
     ```bash
     docker compose build --no-cache frontend
     docker compose up -d frontend
     ```
  3. Recarga la página en tu navegador con **Ctrl + Shift + R** (o **Cmd + Shift + R** en macOS) para limpiar la caché del navegador.

* **Error `port is already allocated` al ejecutar `docker compose up`:**
  Otro programa en tu computadora está usando el puerto `8000`, `8085`, `15432` o `6379`. Detén ese servicio o cambia el puerto izquierdo en `docker-compose.yml` (por ejemplo, `"8086:80"` para el frontend).

* **El celular no carga el enlace o el QR al escanearlo:**
  1. Verifica que tu teléfono y tu computadora estén conectados a la **misma red Wi-Fi** (y no en datos móviles ni en una red de invitados aislada).
  2. Confirma que `frontend/.env` tenga tu IP Wi-Fi real (`192.168.x.x`) y no `127.0.0.1`, `localhost` ni `172.x.x.x`.
  3. Verifica que hayas aplicado las reglas del Firewall del **Paso 4**.

* **Error al leer `.env` en Docker Compose (`unexpected character`):**
  Si creaste `.env` desde PowerShell con comillas extras o formato inválido, bórralo y créalo limpiamente con `Set-Content -Path "frontend\.env" -Value "VITE_API_URL=http://192.168.1.66:8000" -Encoding utf8`.

---

## 🛠️ Comandos Útiles de Mantenimiento (Docker)

* **Ver logs en tiempo real del backend o frontend:**
  ```bash
  docker compose logs -f web
  docker compose logs -f frontend
  ```
* **Reconstruir únicamente el frontend tras cambiar `frontend/.env`:**
  ```bash
  docker compose build --no-cache frontend
  docker compose up -d frontend
  ```
* **Detener todos los contenedores sin borrar la base de datos:**
  ```bash
  docker compose down
  ```
* **Detener contenedores y borrar por completo los volúmenes de datos (reinicio de fábrica):**
  ```bash
  docker compose down -v
  ```

---

## 📤 Subir Cambios a GitHub

Para guardar y subir tus actualizaciones al repositorio remoto:

```bash
git add .
git commit -m "docs: actualizar README completo con guia paso a paso, verificacion y troubleshooting"
git branch -M main
git push origin main
```