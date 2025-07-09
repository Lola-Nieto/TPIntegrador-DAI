# API + APP EVENTOS - NodeJs

## Descripción
API REST para explorar y gestionar eventos, desarrollada con Node.js, Express y PostgreSQL. Incluye autenticación JWT, gestión completa de eventos, inscripciones y ubicaciones.

## Tecnologías Utilizadas
- **Backend**: Node.js, Express, PostgreSQL
- **Autenticación**: JWT (JSON Web Tokens)
- **Encriptación**: bcryptjs
- **Frontend**: React Native + Expo (opcional)

## Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- PostgreSQL
- npm o yarn

### Configuración del Backend

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd TPIntegrador-DAI
```

2. **Instalar dependencias**
```bash
cd backend
npm install
```

3. **Configurar variables de entorno**
Crear un archivo `.env` en la carpeta `backend` con:
```env
# Configuración de la base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eventos_db
DB_USER=postgres
DB_PASSWORD=tu_password_aqui

# Configuración del servidor
PORT=3000

# Clave secreta para JWT (cambiar en producción)
JWT_SECRET=tu_secreto_jwt_super_seguro_cambiar_en_produccion
```

4. **Configurar la base de datos**
- Crear una base de datos PostgreSQL llamada `eventos_db`
- Ejecutar el script `Database.sql` para crear las tablas

5. **Iniciar el servidor**
```bash
npm start
# o para desarrollo
npm run dev
```

### Configuración del Frontend (Opcional)

1. **Instalar dependencias**
```bash
cd frontend
npm install
```

2. **Iniciar la aplicación**
```bash
npm start
```

## Endpoints de la API

### Autenticación

#### POST /api/user/register
Registra un nuevo usuario.

**Body:**
```json
{
    "first_name": "Juan",
    "last_name": "Pérez",
    "username": "juan.perez@email.com",
    "password": "password123"
}
```

**Respuesta exitosa (201):**
```json
{
    "success": true,
    "message": "Usuario registrado exitosamente",
    "user": {
        "id": 1,
        "first_name": "Juan",
        "last_name": "Pérez",
        "username": "juan.perez@email.com"
    }
}
```

#### POST /api/user/login
Autentica un usuario y devuelve un token JWT.

**Body:**
```json
{
    "username": "juan.perez@email.com",
    "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Eventos (Públicos)

#### GET /api/event
Obtiene todos los eventos con paginación y filtros.

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 15)
- `name`: Filtrar por nombre
- `startdate`: Filtrar por fecha (YYYY-MM-DD)
- `tag`: Filtrar por etiqueta

**Ejemplo:**
```
GET /api/event?page=1&limit=10&name=taylor&tag=rock
```

**Respuesta:**
```json
{
    "collection": [
        {
            "id": 1,
            "name": "Taylor Swift Concert",
            "description": "Un espectacular show",
            "start_date": "2024-03-21T03:00:00.000Z",
            "duration_in_minutes": 210,
            "price": "15500",
            "enabled_for_enrollment": true,
            "max_assistance": 120000,
            "event_location": {
                "id": 1,
                "name": "Club Atlético River Plate",
                "full_address": "Av. Pres. Figueroa Alcorta 7597",
                "latitude": -34.54454505693356,
                "longitude": -58.4494761175694,
                "max_capacity": "84567",
                "location": {
                    "id": 3391,
                    "name": "Nuñez",
                    "latitude": -34.548805236816406,
                    "longitude": -58.463230133056641,
                    "province": {
                        "id": 1,
                        "name": "Ciudad Autónoma de Buenos Aires",
                        "full_name": "Ciudad Autónoma de Buenos Aires"
                    }
                }
            },
            "creator_user": {
                "id": 3,
                "username": "Jschiffer",
                "first_name": "Julian",
                "last_name": "Schiffer"
            },
            "tags": [
                {
                    "id": 1,
                    "name": "Rock"
                },
                {
                    "id": 2,
                    "name": "Pop"
                }
            ]
        }
    ],
    "pagination": {
        "limit": 10,
        "offset": 0,
        "nextPage": null,
        "total": "1"
    }
}
```

#### GET /api/event/:id
Obtiene el detalle completo de un evento.

**Respuesta:**
```json
{
    "id": 8,
    "name": "Toto",
    "description": "La legendaria banda estadounidense se presentará en Buenos Aires.",
    "id_event_location": 2,
    "start_date": "2024-11-22T03:00:00.000Z",
    "duration_in_minutes": 120,
    "price": "150000",
    "enabled_for_enrollment": "1",
    "max_assistance": 12000,
    "id_creator_user": 1,
    "event_location": {
        "id": 2,
        "id_location": 3397,
        "name": "Movistar Arena",
        "full_address": "Humboldt 450, C1414 Cdad. Autónoma de Buenos Aires",
        "max_capacity": "15000",
        "latitude": "-34.593488697344405",
        "longitude": "-58.44735886932156",
        "id_creator_user": 1,
        "location": {
            "id": 3397,
            "name": "Villa Crespo",
            "id_province": 2,
            "latitude": "-34.599876403808594",
            "longitude": "-58.438816070556641",
            "province": {
                "id": 2,
                "name": "Ciudad Autónoma de Buenos Aires",
                "full_name": "Ciudad Autónoma de Buenos Aires",
                "latitude": "-34.61444091796875",
                "longitude": "-58.445877075195312",
                "display_order": null
            }
        },
        "creator_user": {
            "id": 1,
            "first_name": "Pablo",
            "last_name": "Ulman",
            "username": "pablo.ulman@ort.edu.ar"
        }
    },
    "tags": [
        {
            "id": 1,
            "name": "rock"
        },
        {
            "id": 2,
            "name": "pop"
        }
    ],
    "creator_user": {
        "id": 1,
        "first_name": "Pablo",
        "last_name": "Ulman",
        "username": "pablo.ulman@ort.edu.ar",
        "password": "******"
    }
}
```

### Eventos (Requieren Autenticación)

#### POST /api/event
Crea un nuevo evento.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
    "name": "Nuevo Evento",
    "description": "Descripción del evento",
    "id_event_location": 1,
    "start_date": "2024-12-25T20:00:00.000Z",
    "duration_in_minutes": 120,
    "price": 5000,
    "enabled_for_enrollment": "1",
    "max_assistance": 1000,
    "tags": ["rock", "pop"]
}
```

#### PUT /api/event/:id
Actualiza un evento existente.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
    "name": "Evento Actualizado",
    "description": "Nueva descripción",
    "price": 6000
}
```

#### DELETE /api/event/:id
Elimina un evento.

**Headers:**
```
Authorization: Bearer <token>
```

### Inscripciones (Requieren Autenticación)

#### POST /api/event/:id/enrollment
Inscribe al usuario autenticado en un evento.

**Headers:**
```
Authorization: Bearer <token>
```

#### DELETE /api/event/:id/enrollment
Cancela la inscripción del usuario autenticado en un evento.

**Headers:**
```
Authorization: Bearer <token>
```

### Participantes (Requieren Autenticación)

#### GET /api/event/:id/participants
Obtiene la lista de participantes de un evento.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 15)

**Respuesta:**
```json
{
    "collection": [
        {
            "user": {
                "id": 3,
                "username": "Jschiffer",
                "first_name": "Julian",
                "last_name": "Schiffer"
            },
            "attended": false,
            "rating": null,
            "description": null
        },
        {
            "user": {
                "id": 1,
                "username": "Polshetta",
                "first_name": "Pablo",
                "last_name": "Ulman"
            },
            "attended": true,
            "rating": 5,
            "description": "Alto Show"
        }
    ],
    "pagination": {
        "limit": 15,
        "offset": 0,
        "nextPage": null,
        "total": "2"
    }
}
```

### Ubicaciones de Eventos (Requieren Autenticación)

#### GET /api/event-location
Obtiene todas las ubicaciones del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /api/event-location/:id
Obtiene una ubicación específica del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

#### POST /api/event-location
Crea una nueva ubicación de evento.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
    "id_location": 3397,
    "name": "Mi Venue",
    "full_address": "Calle Principal 123",
    "max_capacity": 1000,
    "latitude": "-34.593488697344405",
    "longitude": "-58.44735886932156"
}
```

#### PUT /api/event-location/:id
Actualiza una ubicación de evento.

**Headers:**
```
Authorization: Bearer <token>
```

#### DELETE /api/event-location/:id
Elimina una ubicación de evento.

**Headers:**
```
Authorization: Bearer <token>
```

## Códigos de Estado HTTP

- **200**: OK - Operación exitosa
- **201**: Created - Recurso creado exitosamente
- **400**: Bad Request - Error en los datos enviados
- **401**: Unauthorized - Token inválido o faltante
- **404**: Not Found - Recurso no encontrado
- **500**: Internal Server Error - Error interno del servidor

## Validaciones

### Usuario
- `first_name` y `last_name`: mínimo 3 caracteres
- `username`: debe ser un email válido
- `password`: mínimo 3 caracteres

### Evento
- `name` y `description`: mínimo 3 caracteres
- `price` y `duration_in_minutes`: no pueden ser negativos
- `max_assistance`: no puede exceder la capacidad de la ubicación

### Ubicación
- `name`: mínimo 3 caracteres
- `full_address`: mínimo 5 caracteres
- `max_capacity`: debe ser mayor a 0

## Estructura de la Base de Datos

El proyecto incluye un archivo `Database.sql` con la estructura completa de la base de datos, incluyendo:

- **Users**: Usuarios del sistema
- **Events**: Eventos
- **Event_Locations**: Ubicaciones de eventos
- **Locations**: Localidades
- **Provinces**: Provincias
- **Tags**: Etiquetas
- **Event_Tags**: Relación entre eventos y etiquetas
- **Event_Enrollments**: Inscripciones a eventos

## Desarrollo

### Scripts Disponibles

```bash
# Iniciar servidor en modo desarrollo
npm run dev

# Iniciar servidor en modo producción
npm start

# Verificar dependencias
npm list
```

### Estructura del Proyecto

```
backend/
├── configs/
│   └── db-configs.js
├── controllers/
│   ├── apiController.js
│   ├── userController.js
│   └── eventLocationController.js
├── middleware/
│   └── auth.js
├── routes/
│   └── api.js
├── Database.sql
├── index.js
└── package.json

frontend/
├── App.js
├── index.js
└── package.json
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC. 