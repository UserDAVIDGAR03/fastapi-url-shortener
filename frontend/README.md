# Fast URL Shortener

Acortador de URLs full-stack construido con **FastAPI** (Backend), **React + Vite + Tailwind CSS** (Frontend), **PostgreSQL 15** (Base de datos) y **Redis 7** (Caché en memoria).

Incluye:
- Acortamiento de enlaces con identificador aleatorio o alias personalizado (`custom_slug`) y expiración opcional.
- Acceso con cuenta (**JWT**) o **modo invitado** sin registro (`X-Guest-Id`, con límite estricto de 1 enlace por navegador).
- Redirecciones rápidas (`307 Temporary Redirect`) cacheadas en Redis y analítica de clics por enlace.
- Generación y descarga de códigos QR en PNG directamente en el navegador mediante `<canvas>` y la librería `qrcode`.
- Resolución automática de URL del backend sin depender de configuraciones fijas: funciona de inmediato en `localhost` o desde otros dispositivos en la misma red local Wi-Fi.

---

## Prerrequisitos

- **Git**
- **Docker Desktop** (abierto y en ejecución)
- **Python 3.11+** y **Node.js 20+** (solo si deseas correr backend y frontend en modo desarrollo local)

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone [https://github.com/UserDAVIDGAR03/fast-url-shortener.git](https://github.com/UserDAVIDGAR03/fast-url-shortener.git)
cd fast-url-shortener
```

### 2. Variables de entorno (opcional)

El proyecto funciona con valores por defecto sin crear archivos `.env`. Si deseas personalizar claves o URLs, copia las plantillas de ejemplo:

```bash
cp .env.example .env
cp frontend/.env.example frontend/.env
```

- **Resolución automática de la API:** Si `VITE_API_URL` no está definida en `frontend/.env`, el cliente toma automáticamente el protocolo y host actual del navegador apuntando al puerto `8000` (`http://<host-actual>:8000`).
- **Acceso desde otros dispositivos (red local Wi-Fi):** Abre la aplicación desde tu navegador usando la IPv4 local de tu equipo (obtenida con `ipconfig` en Windows o `ip a` en Linux/macOS) en lugar de `localhost`, o define `VITE_API_URL=http://<TU_IP_LOCAL>:8000` en `frontend/.env`.

---

## Cómo Levantar el Proyecto

### Opción 1: Todo con Docker Compose (Recomendado para ejecutar rápido)

Desde la carpeta raíz del proyecto:

```bash
docker compose up -d --build
```

Verifica que los 4 contenedores estén activos:

```bash
docker compose ps
```

- **Aplicación Web (Frontend):** `http://localhost:8085` (o `http://<TU_IP_LOCAL>:8085` en red local)
- **API Backend:** `http://localhost:8000`
- **Documentación Swagger UI:** `http://localhost:8000/docs`
- **PostgreSQL (puerto externo):** `localhost:15432`

Para detener los contenedores sin borrar la base de datos:

```bash
docker compose down
```

---

### Opción 2: Desarrollo Local Híbrido (Con recarga automática)

En este flujo, **PostgreSQL y Redis corren en Docker**, mientras que **Backend y Frontend corren de forma nativa** con hot-reload:

#### 1. Levantar PostgreSQL y Redis en Docker
En la raíz del proyecto:

```bash
docker compose up -d db redis
```

#### 2. Levantar el Backend FastAPI (Terminal 1 — raíz del proyecto)
```bash
python -m venv venv
# Windows (PowerShell): .\venv\Scripts\Activate
# Linux / macOS:       source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Levantar el Frontend React + Vite (Terminal 2 — carpeta `frontend/`)
```bash
cd frontend
npm install
npm run dev -- --host --port 8080 --strictPort
```

- **Aplicación Web (Frontend Vite):** `http://localhost:8080`
- **API Backend:** `http://localhost:8000`
- **Documentación Swagger UI:** `http://localhost:8000/docs`

---

## Cómo Sincronizar Cambios con Docker

Si modificaste código en `app/` o `frontend/` en modo local y quieres actualizar los contenedores:

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

## Cómo Usarlo (Flujo Básico)

1. Abre `http://localhost:8085` (Docker) o `http://localhost:8080` (desarrollo local).
2. Selecciona **Usar sin cuenta (1 enlace)** para probar de inmediato o regístrate / inicia sesión con JWT para gestionar múltiples enlaces.
3. Ingresa una URL larga, define opcionalmente un alias personalizado o tiempo de expiración en horas y presiona **Acortar**.
4. Desde el panel o historial puedes copiar el enlace corto, abrir el modal **QR** para descargarlo en PNG o escanearlo desde otro dispositivo en tu red Wi-Fi, pausar/reactivar el enlace o consultar sus clics en **Analíticas**.

---

## Pruebas y Mantenimiento

- **Ejecutar pruebas automatizadas con Pytest (con `db` y `redis` activos):**
  ```bash
  pytest -v
  ```
- **Ejecutar pruebas dentro del contenedor Docker:**
  ```bash
  docker compose exec web pytest -v
  ```
- **Ver logs en tiempo real:**
  ```bash
  docker compose logs -f web frontend
  ```
- **Reiniciar desde cero eliminando volúmenes de datos:**
  ```bash
  docker compose down -v
  ```