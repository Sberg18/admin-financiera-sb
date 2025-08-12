# Deployment en Render

## Pasos para deployment:

### 1. Preparar el repositorio
- Asegúrate de que todos los cambios estén commiteados y pusheados a GitHub
- El proyecto debe tener el Dockerfile en la raíz

### 2. Crear la base de datos en Render
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Crea un nuevo PostgreSQL database:
   - Name: `admin-financiera-db`
   - Database Name: `admin_financiera`
   - User: `admin_user`
   - Plan: Free

### 3. Crear el Web Service
1. En Render Dashboard, crea un nuevo Web Service
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Environment**: Docker
   - **Build Command**: `docker build -t admin-financiera .`
   - **Start Command**: `docker run -p $PORT:3001 admin-financiera`

### 4. Variables de entorno
Configura estas variables en Render:

```
NODE_ENV=production
DATABASE_URL=[URL de la base de datos de Render]
JWT_SECRET=[genera un string random seguro]
PORT=3001
```

**Importante**: 
- `DATABASE_URL` se obtiene de la base de datos creada en el paso 2
- `JWT_SECRET` debe ser un string largo y seguro (puedes usar: `openssl rand -base64 64`)

### 5. Deploy
- Una vez configurado, Render comenzará el deployment automáticamente
- El proceso puede tomar varios minutos
- La aplicación estará disponible en la URL proporcionada por Render

## Estructura del deployment:
- Frontend se construye y se sirve desde el backend
- Todas las rutas `/api/*` van al backend de Express
- Todas las demás rutas sirven el React app
- Base de datos PostgreSQL hosteada en Render

## Troubleshooting:
- Si hay errores de conexión a DB, verifica la DATABASE_URL
- Si hay errores 404, verifica que el frontend esté compilándose correctamente
- Logs están disponibles en el dashboard de Render