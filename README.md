# Fast URL Shortener

Aplicación web Full-Stack de acortamiento de URLs de alto rendimiento, construida con **FastAPI** (Backend), **React + Vite + Tailwind CSS** (Frontend), **PostgreSQL 15** (Base de datos) y **Redis 7** (Caché en memoria). Soporta tanto ejecución contenerizada completa mediante **Docker Compose** como un **flujo híbrido de desarrollo local** con recarga automática, e integra autenticación JWT, modo invitado con límite estricto de 1 enlace, analíticas detalladas, códigos QR generados en cliente y descargables en PNG, y resolución dinámica de URL para acceso multi-dispositivo en red local Wi-Fi.

---

## Problema Resuelto y Características Principales

### Desafíos Resueltos
1. **Cuellos de botella en la base de datos y latencia:** Depender de bases de datos basadas en archivos (como SQLite) degrada el rendimiento en redirecciones concurrentes. Se migró a **PostgreSQL 15** mediante SQLAlchemy ORM, garantizando durabilidad y conformidad ACID.
2. **Saturación por redirecciones frecuentes:** Se integró **Redis** como capa de caché en memoria (*Cache-Aside*) para resolver enlaces cortos frecuentes en milisegundos sin consultar PostgreSQL en cada redirección (`307 Temporary Redirect`), delegando el registro de visitas a tareas en segundo plano.
3. **Flexibilidad entre desarrollo ágil y despliegue en contenedores:** Permite levantar `db` y `redis` en Docker mientras desarrollas FastAPI (`--reload`) y React + Vite (`--port 8080 --strictPort`) de forma nativa, o levantar todo el stack en Docker Compose con red interna y puertos aislados (`15432` externo para PostgreSQL, `8000` para Backend y `8085` para Frontend).
4. **Control de acceso, seguridad de flujo y experiencia multi-dispositivo:** Incluye registro e inicio de sesión con **JWT**, modo invitado identificado por `X-Guest-Id` (`fast_url_guest_id` en `localStorage`) con límite estricto de 1 URL activa, control de vistas y retorno seguro, panel de analíticas (`/api/urls/{short_id}/analytics`), generación local de códigos QR en `<canvas>` con `qrcode` y descarga en PNG, y resolución automática de la URL del backend sin depender de configuraciones fijas.

---

## Arquitectura del Sistema

### Modo Contenerizado Completo (Docker Compose)

```text
+-----------------------------------------------------------------------+
|                   Dispositivos en la Red (PC / Móvil)                 |
+-----------------------------------+-----------------------------------+
                                    |
          +-------------------------+-------------------------+
          | HTTP :8085 (Interfaz Web)                         | HTTP :8000 (API y Redirección)
          v                                                   v
+-----------------------------------+       +-----------------------------------+
|  Frontend: react_url_shortener    | ----> |   Backend: fastapi_url_shortener  |
|  (React + Vite + Nginx)           |  API  |   (Python 3.11+ + FastAPI)        |
+-----------------------------------+  REST +-----------------+-----------------+
                                                              |
                                              +---------------+---------------+
                                              |                               |
                                              v (SQLAlchemy ORM)              v (redis-py)
                                    +-------------------+           +-------------------+
                                    |  PostgreSQL 15    |           |     Redis 7       |
                                    |  (postgres_db)    |           |   (redis_cache)   |
                                    |  Puerto 15432:5432|           |   Puerto 6379     |
                                    +-------------------+           +-------------------+
```

### Modo Híbrido de Desarrollo Local

```text
+-----------------------------------------------------------------------+
|              Equipo Local (Windows / Linux / macOS) + Wi-Fi           |
+-----------------------------------+-----------------------------------+
                                    |
          +-------------------------+-------------------------+
          | HTTP :8080 (Vite Dev Server)                      | HTTP :8000 (Uvicorn --reload)
          v                                                   v
+-----------------------------------+       +-----------------------------------+
|  Frontend Local (frontend/)       | ----> |   Backend Local (app/)            |
|  React + Vite + Tailwind CSS      |  API  |   Python 3.11+ + FastAPI          |
+-----------------------------------+  REST +-----------------+-----------------+
                                                              |
                                              +---------------+---------------+
                                              |                               |
                                              v (SQLAlchemy ORM)              v (redis-py)
                                    +-------------------+           +-------------------+
                                    |  PostgreSQL 15    |           |     Redis 7       |
                                    |  Docker: db       |           |   Docker: redis   |
                                    |  Puerto 15432:5432|           |   Puerto 6379     |
                                    +-------------------+           +-------------------+
```

---

## Estructura Real del Proyecto

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
│   ├── models.py                   # Modelos relacionales ORM (User, URLItem, ClickEvent)
│   ├── routes.py                   # Endpoints REST (/auth/*, /api/shorten, /api/urls, /api/analytics, /{short_id})
│   └── schemas.py                  # Esquemas de validación de entrada/salida con Pydantic
├── frontend/                       # Código fuente del Frontend (React + Vite)
│   ├── public/                     # Recursos estáticos públicos
│   ├── src/
│   │   ├── assets/                 # Imágenes e íconos
│   │   ├── components/             # Componentes modulares de interfaz de usuario
│   │   │   ├── AnalyticsModal.jsx  # Modal de métricas y clics por enlace
│   │   │   ├── AuthView.jsx        # Vista de inicio de sesión, registro y retorno seguro
│   │   │   ├── BlueBubblesBg.jsx   # Fondo visual decorativo
│   │   │   ├── FlowLinesBg.jsx     # Fondo visual decorativo
│   │   │   ├── GreenBubblesBg.jsx  # Fondo visual decorativo
│   │   │   ├── Navbar.jsx          # Barra de navegación superior, cuota de invitado y sesión
│   │   │   ├── QrModal.jsx         # Renderizado de QR en <canvas> con qrcode y descarga PNG
│   │   │   ├── ResultCard.jsx      # Tarjeta con enlace corto generado y botón de copiado
│   │   │   ├── ShortenerForm.jsx   # Formulario para acortar nuevas URLs, alias y expiración
│   │   │   ├── SignalWavesBg.jsx   # Fondo visual decorativo
│   │   │   ├── StatsCards.jsx      # Tarjetas resumen de enlaces activos, clics y más visitado
│   │   │   ├── UrlHistoryTable.jsx # Tabla de historial con pausa/activar, QR, analíticas y borrar
│   │   │   └── WelcomeView.jsx     # Pantalla inicial de bienvenida y selección de acceso
│   │   ├── services/
│   │   │   └── api.js              # Cliente Axios, interceptores JWT/X-Guest-Id y fallback dinámico
│   │   ├── App.css                 # Estilos específicos de componentes
│   │   ├── App.jsx                 # Orquestación de vistas (welcome, login, register, app) y sesión
│   │   ├── index.css               # Importación de Tailwind CSS y estilos base
│   │   └── main.jsx                # Punto de montaje de React e importación de estilos
│   ├── .env.example                # Plantilla opcional de variables de entorno del frontend
│   ├── Dockerfile                  # Construcción multi-etapa (Node Alpine -> Nginx Alpine)
│   ├── index.html                  # Plantilla HTML principal
│   ├── package.json                # Dependencias y scripts de Vite/React (incluye qrcode)
│   └── vite.config.js              # Configuración de Vite (host, puerto 8080, strictPort, plugins)
├── tests/                          # Pruebas automatizadas del backend
│   ├── __init__.py
│   └── test_main.py                # Suite de pruebas unitarias e integración con Pytest
├── .dockerignore                   # Exclusiones para la imagen Docker del backend
├── .env.example                    # Plantilla opcional de variables de entorno del backend
├── .gitignore                      # Archivos ignorados por Git
├── Dockerfile                      # Imagen Docker para el servidor FastAPI
├── docker-compose.yml              # Orquestación de web, frontend, db y redis
├── requirements.txt                # Dependencias de Python (FastAPI, SQLAlchemy, Redis, Pytest, etc.)
└── README.md                       # Documentación completa del proyecto
```

---

## Prerrequisitos

Antes de descargar y ejecutar el proyecto, asegúrate de contar con:

1. **Git:** Para clonar el repositorio ([Descargar Git](https://git-scm.com/downloads)).
2. **Docker Desktop (o Docker Engine + Docker Compose):** Indispensable para levantar los servicios sin instalar bases de datos manualmente ([Descargar Docker Desktop](https://www.docker.com/products/docker-desktop/)). *Asegúrate de que Docker Desktop esté abierto y en ejecución antes de correr los comandos.*
3. **Puertos libres en tu máquina:** Verifica que los puertos `8000` (Backend), `8080` (Frontend en desarrollo híbrido), `8085` (Frontend en Docker Compose), `15432` (PostgreSQL) y `6379` (Redis) no estén ocupados por otros programas locales.
4. **Opcional (solo si deseas ejecutar el entorno local fuera de Docker):**
   - **Python 3.11 o superior**
   - **Node.js 20 o superior**

---

## Guía Paso a Paso de Instalación y Ejecución

### Paso 1: Clonar el Repositorio

Abre una terminal (PowerShell en Windows, Terminal en macOS/Linux) y ejecuta:

```bash
git clone [https://github.com/UserDAVIDGAR03/fast-url-shortener.git](https://github.com/UserDAVIDGAR03/fast-url-shortener.git)
cd fast-url-shortener
```

---

### Paso 2: Variables de Entorno (Opcional)

El proyecto funciona con valores por defecto sin necesidad de crear archivos `.env` manualmente:

- En el **backend**, `docker-compose.yml` provee valores por defecto para PostgreSQL, Redis y JWT.
- En el **frontend**, `frontend/src/services/api.js` resuelve automáticamente la URL del backend tomando `VITE_API_URL` si existe o deduciendo `http://<host-actual>:8000` desde el navegador.

Si deseas personalizar valores o fijar la URL del backend manualmente, copia las plantillas de ejemplo:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

Si vas a compilar el frontend en Docker y quieres escanear códigos QR desde un celular en la misma red Wi-Fi, obtén tu dirección IPv4 local (`ipconfig` en Windows o `ip a` en Linux/macOS) y defínela en `frontend/.env` antes de construir:

```env
VITE_API_URL=http://<TU_IP_LOCAL>:8000
```

- **Comando rápido en Windows (PowerShell, desde la raíz del proyecto):**
  ```powershell
  Set-Content -Path "frontend\.env" -Value "VITE_API_URL=http://<TU_IP_LOCAL>:8000" -Encoding utf8
  ```
- **Comando rápido en Linux / macOS (desde la raíz del proyecto):**
  ```bash
  echo "VITE_API_URL=http://<TU_IP_LOCAL>:8000" > frontend/.env
  ```

---

### Paso 3A: Levantar Todo el Proyecto con Docker Compose (Opción Rápida)

Con **Docker Desktop abierto**, ejecuta desde la carpeta raíz del proyecto:

```bash
docker compose up -d --build
```

#### ¿Qué hace este comando automáticamente?
1. **`postgres_db` (PostgreSQL 15):** Crea el contenedor de base de datos, inicializa la base `url_shortener_db` y expone el puerto `15432` en tu máquina (mapeado al `5432` interno) con almacenamiento persistente en el volumen `postgres_data`.
2. **`redis_cache` (Redis 7):** Inicia el servidor de caché en memoria en el puerto `6379`.
3. **`fastapi_url_shortener` (Backend FastAPI):** Espera a que PostgreSQL pase su *healthcheck*, crea automáticamente todas las tablas mediante SQLAlchemy al arrancar y levanta la API en el puerto **`8000`**.
4. **`react_url_shortener` (Frontend React + Nginx):** Compila la interfaz web y la sirve en el puerto **`8085`**.

#### Verificar que los 4 contenedores estén activos:
```bash
docker compose ps
```
Todos los servicios (`fastapi_url_shortener`, `react_url_shortener`, `postgres_db`, `redis_cache`) deben aparecer con estado **`Up`** (y `postgres_db` como `healthy`).

---

### Paso 3B: Levantar en Modo Híbrido de Desarrollo Local (Con Recarga Automática)

Si estás desarrollando y quieres recarga en caliente en backend y frontend manteniendo PostgreSQL y Redis en Docker:

1. **Levantar PostgreSQL y Redis en Docker (raíz del proyecto):**
   ```bash
   docker compose up -d db redis
   ```

2. **Levantar el Backend FastAPI (Terminal 1 — raíz del proyecto):**
   ```bash
   python -m venv venv
   # Windows (PowerShell): .\venv\Scripts\Activate
   # Linux / macOS:       source venv/bin/activate

   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Levantar el Frontend React + Vite en puerto fijo `8080` (Terminal 2 — carpeta `frontend/`):**
   ```bash
   cd frontend
   npm install
   npm run dev -- --host --port 8080 --strictPort
   ```

#### Sincronizar cambios locales con Docker Compose
Cuando termines tus modificaciones locales en `app/` o `frontend/` y quieras actualizar los contenedores:

1. Detén los servidores locales de Uvicorn y Vite (`Ctrl + C` en ambas terminales).
2. Reconstruye y levanta los servicios desde la raíz del proyecto:
   ```bash
   docker compose up -d --build
   ```
3. Para volver después al modo híbrido (dejando solo `db` y `redis` en Docker):
   ```bash
   docker compose stop web frontend
   ```

---

### Paso 4: Permitir Acceso desde Otros Dispositivos en la Red Local (Opcional)

Si deseas abrir la aplicación o escanear códigos QR desde tu celular conectado a la misma red Wi-Fi, permite las conexiones entrantes hacia los puertos correspondientes:

- **En Windows (PowerShell como Administrador):**
  ```powershell
  New-NetFirewallRule -DisplayName "FastURL Backend 8000" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow
  New-NetFirewallRule -DisplayName "FastURL Frontend 8080" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
  New-NetFirewallRule -DisplayName "FastURL Frontend Docker 8085" -Direction Inbound -LocalPort 8085 -Protocol TCP -Action Allow
  ```
- **En Linux (si usas UFW):**
  ```bash
  sudo ufw allow 8000/tcp
  sudo ufw allow 8080/tcp
  sudo ufw allow 8085/tcp
  ```
- **En macOS:** Normalmente no requiere configuración adicional si aceptas las conexiones entrantes cuando el sistema lo solicite.

---

## Verificación Rápida de Funcionamiento (Flujo de Prueba en 1 Minuto)

1. Abre **`http://localhost:8085`** (en Docker Compose) o **`http://localhost:8080`** (en desarrollo híbrido).
2. En la pantalla inicial, elige **Usar sin cuenta (1 enlace)** para probar de inmediato sin registro o haz clic en **Crear cuenta** / **Iniciar sesión** para operar con JWT sin límite de enlaces.
3. Pega una URL larga (por ejemplo, `https://www.github.com`), opcionalmente define un alias personalizado o expiración en horas y presiona **Acortar**.
4. Verifica que en la tarjeta de resultado y en el historial aparezca el enlace corto generado.
5. Haz clic en el botón **QR** de ese enlace, descárgalo en PNG o escanéalo con la cámara de tu teléfono (conectado al mismo Wi-Fi) y comprueba que redirige correctamente a la página original y suma +1 clic en **Analíticas**.

---

## Puntos de Acceso de la Aplicación

| Servicio | URL Local (Misma PC) | URL Red Local (Celular / Otros equipos) | Descripción |
| :--- | :--- | :--- | :--- |
| **Frontend (Docker Compose)** | `http://localhost:8085` | `http://<TU_IP_LOCAL>:8085` | Interfaz web en React compilada y servida por Nginx en contenedor. |
| **Frontend (Desarrollo Híbrido)** | `http://localhost:8080` | `http://<TU_IP_LOCAL>:8080` | Servidor de desarrollo Vite con recarga en caliente en puerto `8080`. |
| **API Backend** | `http://localhost:8000` | `http://<TU_IP_LOCAL>:8000` | Servidor FastAPI que procesa peticiones y ejecuta las redirecciones `/{short_id}`. |
| **Documentación Swagger UI** | `http://localhost:8000/docs` | `http://<TU_IP_LOCAL>:8000/docs` | Interfaz interactiva para probar todos los endpoints REST directamente. |
| **Base de Datos PostgreSQL** | `localhost:15432` | — | Acceso externo para clientes SQL (DBeaver, pgAdmin) con usuario `postgres` y pass `secretpassword`. |

---

## Resumen de Endpoints Principales de la API

- **`POST /auth/register`** — Registra un nuevo usuario (`email`, `password`).
- **`POST /auth/login`** — Inicia sesión y devuelve el token `access_token` (JWT Bearer).
- **`POST /api/shorten`** — Crea una URL acortada (acepta usuario autenticado vía JWT o invitado vía cabecera `X-Guest-Id` con límite de 1 enlace).
- **`GET /api/urls`** — Lista el historial de URLs pertenecientes al usuario o sesión invitada actual.
- **`PATCH /api/urls/{short_id}/toggle`** — Activa o desactiva temporalmente un enlace acortado e invalida/actualiza su caché en Redis.
- **`DELETE /api/urls/{short_id}`** — Elimina permanentemente un enlace y limpia su caché en Redis.
- **`GET /api/urls/{short_id}/analytics`** — Obtiene estadísticas detalladas de clics, fechas y métricas del enlace.
- **`GET /{short_id}`** — Redirige (`307 Temporary Redirect`) hacia la URL original buscando primero en Redis y respaldando en PostgreSQL.

---

## Ejecutar Pruebas Automatizadas (Pytest)

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

## Solución de Problemas Frecuentes

- **Los enlaces o códigos QR apuntan a `localhost` al escanear desde el celular:**
  1. Abre la aplicación web desde el navegador usando tu IP local (`http://<TU_IP_LOCAL>:8080` en desarrollo) o define `VITE_API_URL=http://<TU_IP_LOCAL>:8000` en `frontend/.env` y reconstruye el contenedor frontend:
     ```bash
     docker compose build --no-cache frontend
     docker compose up -d frontend
     ```
  2. Recarga la página en tu navegador con **Ctrl + Shift + R** (o **Cmd + Shift + R** en macOS) para limpiar la caché.

- **Vite cambia de puerto o la interfaz se ve sin estilos de Tailwind CSS:**
  1. Arranca Vite fijando el puerto: `npm run dev -- --host --port 8080 --strictPort`.
  2. Verifica que `frontend/src/index.css` importe Tailwind CSS, que `frontend/src/main.jsx` importe `./index.css` y que el plugin de Tailwind esté registrado en `frontend/vite.config.js`.

- **Error `port is already allocated` al ejecutar `docker compose up`:**
  Otro programa en tu computadora está usando el puerto `8000`, `8085`, `15432` o `6379`. Detén ese servicio o ajusta el puerto en `docker-compose.yml`.

- **El celular no carga el enlace o el QR al escanearlo:**
  1. Verifica que tu teléfono y tu computadora estén conectados a la **misma red Wi-Fi** (y no en datos móviles ni en una red de invitados aislada).
  2. Confirma que estás usando tu IP Wi-Fi real (`192.168.x.x` o `10.x.x