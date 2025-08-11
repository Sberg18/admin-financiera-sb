# Administración Financiera Personal

Una aplicación web completa para la gestión de finanzas personales, construida con React, Node.js, PostgreSQL y Docker.

## Características

### 🔐 Autenticación
- Registro e inicio de sesión seguro
- Autenticación JWT con tokens persistentes
- Middleware de autenticación para rutas protegidas
- **Sistema de Onboarding**: Tutorial guiado para nuevos usuarios

### 💰 Gestión Financiera
- **Ingresos**: Registra y categoriza tus ingresos
- **Gastos**: Control completo de gastos con múltiples métodos de pago
- **Tarjetas de Crédito**: Soporte para múltiples tarjetas de diferentes bancos
- **Cuotas**: Sistema inteligente para manejar compras en cuotas
- **Categorización**: Organiza tus transacciones por categorías

### 📊 Reportes y Analytics
- **Dashboard Interactivo**: Resúmenes financieros clickeables
- **Balance Detallado**: Modal con desglose completo de ingresos y gastos
- **Tasa de Ahorro**: Cálculo automático y proyecciones anuales
- **Agrupación Inteligente**: Por método de pago y tipo de ingreso
- Filtros por mes y año
- Visualización por categorías con íconos y colores

### 🏦 Soporte Multi-Banco
- Banco Santander, Galicia, BBVA, Nación, Macro, HSBC, Ciudad
- Tipos de tarjeta: Visa, Mastercard, American Express
- **Configuración Flexible**: Días de cierre y pago opcionales (defaults: 31 y 10)

### 💎 Gestión de Activos e Inversiones
- **Divisas**: USD, EUR con tracking de precios
- **Acciones**: Argentinas e internacionales
- **Bonos**: Soberanos y corporativos  
- **Criptomonedas**: Bitcoin, Ethereum
- **Ahorros**: Plazos fijos, fondos de inversión
- **Valorización**: Precios de compra vs actuales

## Tecnologías

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** con **Sequelize ORM**
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas
- **express-validator** para validación
- **helmet** y **cors** para seguridad

### Frontend
- **React 18** + **Vite**
- **Material-UI (MUI)** para componentes
- **React Router** para navegación
- **React Query** para manejo de estado del servidor
- **Axios** para peticiones HTTP
- **Day.js** para manejo de fechas

### DevOps
- **Docker** + **Docker Compose**
- **PostgreSQL 15** en contenedor
- Hot reload en desarrollo
- Variables de entorno configurables

## Instalación y Uso

### Prerrequisitos
- Docker y Docker Compose instalados
- Git

### Clonar el repositorio
```bash
git clone <repository-url>
cd admin-financiera-sb
```

### Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DB_HOST=postgres
DB_PORT=5432
DB_NAME=admin_financiera
DB_USER=admin
DB_PASSWORD=admin123

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# URLs
FRONTEND_URL=http://localhost:3000

# Node
NODE_ENV=development
```

### Ejecutar con Docker
```bash
# Construir y ejecutar todos los servicios
docker-compose up --build

# Para ejecutar en segundo plano
docker-compose up -d --build
```

### Acceder a la aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Base de datos**: localhost:5432

## Estructura del Proyecto

```
admin-financiera-sb/
├── docker-compose.yml          # Configuración de Docker Compose
├── backend/                    # API Node.js
│   ├── src/
│   │   ├── config/            # Configuración de base de datos
│   │   ├── controllers/       # Controladores de rutas
│   │   ├── middleware/        # Middlewares (auth, validación)
│   │   ├── models/           # Modelos de Sequelize
│   │   ├── routes/           # Definición de rutas
│   │   └── server.js         # Servidor principal
│   ├── init.sql              # Script de inicialización de DB
│   ├── package.json
│   └── Dockerfile
├── frontend/                  # Aplicación React
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   ├── context/         # Context de React (Auth)
│   │   ├── pages/           # Páginas principales
│   │   ├── services/        # Servicios de API
│   │   └── utils/           # Utilidades
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
└── README.md
```

## Esquema de Base de Datos

### Tablas principales:
- **users**: Información de usuarios
- **banks**: Catálogo de bancos
- **card_types**: Tipos de tarjetas (Visa, MC, AMEX)
- **credit_cards**: Tarjetas de crédito del usuario
- **expenses**: Registro de gastos
- **incomes**: Registro de ingresos
- **income_categories**: Categorías de ingresos
- **expense_categories**: Categorías de gastos

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil del usuario

### Gastos
- `POST /api/expenses` - Crear gasto
- `GET /api/expenses` - Listar gastos (con filtros)
- `DELETE /api/expenses/:id` - Eliminar gasto

### Ingresos
- `POST /api/incomes` - Crear ingreso
- `GET /api/incomes` - Listar ingresos (con filtros)
- `DELETE /api/incomes/:id` - Eliminar ingreso

## Funcionalidades Especiales

### Sistema de Cuotas
Cuando registras un gasto con tarjeta de crédito en cuotas:
- Se crean automáticamente los registros mensuales
- Cada cuota tiene su fecha correspondiente
- Se calcula el monto de cada cuota automáticamente

### Filtros de Fecha
- Filtrar por mes y año específico
- Paginación para grandes volúmenes de datos
- Ordenamiento cronológico

## Desarrollo

### Comandos útiles
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Acceder a la base de datos
docker exec -it admin-financiera-db psql -U admin -d admin_financiera

# Reconstruir un servicio específico
docker-compose up --build backend

# Detener todos los servicios
docker-compose down

# Eliminar volúmenes (¡cuidado, borra datos!)
docker-compose down -v
```

### Variables de entorno disponibles
- `NODE_ENV`: Entorno de ejecución
- `DB_*`: Configuración de base de datos
- `JWT_SECRET`: Secreto para tokens JWT
- `FRONTEND_URL`: URL del frontend para CORS

## Próximas Funcionalidades

- [ ] Categorías personalizables
- [ ] Reportes avanzados con gráficos
- [ ] Exportación a Excel/PDF
- [ ] Presupuestos y alertas
- [ ] Recordatorios de pagos
- [ ] Dashboard mejorado con analytics
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)

## Contribuir

1. Fork del proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## Soporte

Si encuentras algún problema o tienes sugerencias, por favor abre un issue en el repositorio.