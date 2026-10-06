# hotelSJB — Suite Integral de Hospedaje & Gestión Hotelera

> **hotelSJB** es una plataforma moderna para la gestión operativa y comercial de establecimientos de hospedaje, integrando una **Página Web Informativa y Comercial (PWA)**, un **CMS Administrativo** y un **Sistema PMS (Property Management System)** para recepción, reservas, gobernanza (*Housekeeping*), caja y parametrización de estados y colores.

---

## 1. Arquitectura del Sistema y Despliegue

### 1.1. Frontend (Angular 19+ PWA en Servidor Compartido cPanel)
* **Tecnología:** Angular con Standalone Components, Signals y Web App Manifest (`manifest.webmanifest`).
* **Instalable:** Web App PWA que permite instalación directa en la pantalla de inicio móvil (Android/iOS) con barra de navegación táctil inferior y panel adaptado para escritorio.
* **Componentes 100% Personalizados:**
  * **Cero Emojis:** Iconografía vectorial SVG nativa (`app-icon`).
  * **Cero Alertas Nativas:** Sistema de confirmaciones y modales flotantes (`DialogService`), notificaciones toast con auto-cierre (`ToastService`), selectores con búsqueda y badges (`CustomSelectComponent`), y checkboxes personalizados (`CustomCheckboxComponent`).
* **Hosting cPanel:** 
  * Se compila estáticamente a `frontend/dist/frontend/browser/`.
  * Incluye archivo `.htaccess` con reglas de reescritura Apache para soportar el enrutamiento SPA sin errores 404.

### 1.2. Backend (NestJS en Contenedor Docker en Servidor VPS)
* **Tecnología:** NestJS (Node 20 Alpine) con TypeORM y TypeScript estricto.
* **Base de Datos:** Se conecta directamente a la instancia **MySQL 8.x nativa existente en el host del VPS** a través de `host.docker.internal` / IP privada del host.
* **Aislamiento:** Docker se utiliza **exclusivamente para el backend**, garantizando portabilidad, bajo consumo de RAM (< 120 MB) y CI/CD simplificado.
* **Documentación API:** Swagger / OpenAPI disponible en `/api/docs`.

---

## 2. Principio Paramétrico: Estados y Colores Dinámicos (Cero ENUMs)

Todas las constantes operativas han sido modeladas como **tablas maestras relacionales parametrizables**:
* **`room_operational_statuses`:** Estados operativos (Disponible, Ocupada, Mantenimiento, Bloqueada) con nombres, colores HEX (`color_hex`, `badge_bg_hex`, `badge_text_hex`) e iconos SVG editables desde la interfaz.
* **`room_housekeeping_statuses`:** Estados de limpieza (Limpia, Sucia, En Limpieza, Inspeccionada) con colores e iconos configurables.
* **`reservation_statuses`:** Estados de reserva (Pendiente, Confirmada, Con Check-In, Finalizada, Cancelada, No-Show).
* **`payment_methods`:** Métodos de pago (Efectivo, Tarjetas, Transferencias, Billeteras Digitales).
* **`document_types`:** Tipos de documento de identidad (DNI, Pasaporte, C.E., etc.).

El hotel puede modificar la paleta de colores y nombres de los estados directamente desde el módulo **`/pms/statuses`** sin necesidad de alterar código ni ejecutar migraciones manuales.

---

## 3. Módulos del Sistema

1. **Wizard de Configuración Inicial (Onboarding - `/setup`):**
   * Detecta en el primer arranque si el establecimiento no ha sido configurado.
   * Solicita: Nombre comercial, Razón social, RUC/NIT, Dirección, Teléfono, WhatsApp oficial, Correo, Moneda, Impuestos, Horarios de Check-In/Check-Out, y credenciales maestras del **Superadministrador**.
   * Crea automáticamente el catálogo inicial de tipos de habitaciones y habitaciones de muestra.
2. **Página Web Pública Informativa (`/`):**
   * Catálogo de habitaciones con fotos, capacidades y amenidades.
   * Motor de cotización directa y botón a WhatsApp con mensaje precargado.
   * Sección de servicios destacados y horarios oficiales.
   * Enlace discreto para el acceso del personal al PMS.
3. **Control de Acceso y RBAC (`/login`):**
   * Autenticación con JWT, contraseñas hasheadas con bcrypt y roles granulares (Superadmin, Administrador, Recepcionista, Housekeeping).
4. **Rack de Habitaciones Interactivo (`/pms/rack`):**
   * Malla visual organizada por pisos con colores dinámicos según el estado de ocupación y limpieza.
   * Actualización rápida de estados mediante modal personalizado.
   * Contadores en vivo de habitaciones disponibles, ocupadas y en aseo.
5. **Gestión de Reservas & Folio (`/pms/reservations`):**
   * Registro de reservas y huéspedes (Walk-in y anticipadas).
   * Botón de Check-In directo (pasa la habitación a *Ocupada*).
   * Botón de Check-Out con cálculo de balance pendiente (pasa la habitación a *Sucia*).
   * Consulta de folio de cuenta con cargos extras y pagos.
6. **Módulo Móvil de Housekeeping (`/pms/housekeeping`):**
   * Vista de tarjetas táctiles para camareras con cambio rápido a *En Limpieza*, *Limpia / Lista* o *Sucia*.
7. **Gestor de Estados y Colores HEX (`/pms/statuses`):**
   * Editor visual con vista previa en tiempo real para modificar los colores y nombres de cada estado.

---

## 4. Estructura de Ramas Git (Git Flow)

* **`main`:** Código de producción. Cualquier push a esta rama dispara el despliegue automático del backend al VPS y del frontend al cPanel.
* **`develop`:** Rama activa de desarrollo e integración.
* **`feature/*`:** Ramas de características específicas derivadas de `develop`.

---

## 5. Instrucciones de Ejecución Local y Despliegue

### 5.1. Ejecución en Desarrollo Local

#### Backend (NestJS):
```bash
cd backend
npm install
# Configure sus variables de MySQL en .env
npm run start:dev
```
*API escuchando en: `http://localhost:3000/api`*
*Documentación Swagger: `http://localhost:3000/api/docs`*

#### Frontend (Angular):
```bash
cd frontend
npm install --ignore-scripts
npm start
```
*Web App en: `http://localhost:4200`*

### 5.2. Despliegue del Backend en VPS (Docker)
1. Clonar el repositorio en `/opt/hotelsjb` del VPS.
2. Copiar `.env.example` a `.env` y configurar credenciales de MySQL y secretos:
```bash
cp .env.example .env
nano .env
```
3. Construir y levantar el contenedor:
```bash
docker compose up -d --build backend-api
```

### 5.3. Despliegue del Frontend en cPanel
1. Compilar el frontend para producción:
```bash
cd frontend
npm run build -- --configuration=production
```
2. Subir el contenido de la carpeta `frontend/dist/frontend/browser/` (incluyendo `.htaccess` y `manifest.webmanifest`) al directorio `public_html` (o la carpeta del subdominio) de su cPanel vía Administrador de Archivos o FTPS.

---

## 6. Variables Secretas para GitHub Actions (CI/CD)

Configure los siguientes **Repository Secrets** en GitHub (`Settings > Secrets and variables > Actions`):

| Secreto | Descripción |
| :--- | :--- |
| `VPS_HOST` | Dirección IP o dominio del servidor VPS |
| `VPS_USER` | Usuario SSH con permisos de Docker en el VPS (ej. `root` o `ubuntu`) |
| `VPS_SSH_KEY` | Clave privada SSH para el despliegue desatendido |
| `CPANEL_FTP_SERVER` | Servidor FTP del cPanel (ej. `ftp.tudominio.com`) |
| `CPANEL_FTP_USERNAME` | Usuario FTP del cPanel |
| `CPANEL_FTP_PASSWORD` | Contraseña del usuario FTP del cPanel |
