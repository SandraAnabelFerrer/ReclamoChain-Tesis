# 🔐 Sistema de Autenticación y Roles

## 📋 Descripción

Se ha implementado un sistema completo de autenticación con roles (admin/user) que permite:

- **Administradores**: Acceso completo al panel administrativo
- **Usuarios**: Acceso a su propia vista de siniestros y capacidad de pagarlos

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

### 2. Crear Usuario Administrador

Ejecuta el script para crear el primer usuario administrador:

```bash
node scripts/create-admin-user.js
```

O con parámetros personalizados:

```bash
node scripts/create-admin-user.js admin@seguros.com admin123 "Nombre Admin"
```

**Credenciales por defecto:**
- Email: `admin@seguros.com`
- Contraseña: `admin123`
- Nombre: `Administrador`

⚠️ **IMPORTANTE**: Cambia la contraseña después del primer login.

### 3. Crear Usuarios Comunes

Los usuarios comunes pueden registrarse a través de la API o crearse manualmente. Por ahora, puedes crear usuarios directamente en MongoDB o crear un endpoint de registro.

## 📁 Estructura de Archivos

```
models/
  ├── usuario.ts          # Modelo de Usuario con roles
  └── reclamo.ts          # Modelo de Reclamo (existente)

lib/
  ├── authService.ts      # Servicio de autenticación
  └── auth.ts            # Utilidades de autenticación

app/
  ├── login/
  │   └── page.tsx       # Página de login
  ├── mis-siniestros/
  │   └── page.tsx        # Vista de siniestros para usuarios
  └── api/
      └── auth/
          ├── login/     # POST /api/auth/login
          ├── logout/    # POST /api/auth/logout
          └── me/        # GET /api/auth/me

components/
  ├── auth-guard.tsx     # Componente para proteger rutas
  ├── user-layout.tsx    # Layout para usuarios comunes
  └── main-layout.tsx    # Layout para administradores (existente)
```

## 🔑 Roles y Permisos

### Rol: `admin`
- Acceso al panel administrativo (`/`, `/admin`)
- Gestión de todos los reclamos
- Procesamiento de pagos
- Estadísticas y reportes
- Gestión de usuarios

### Rol: `user`
- Acceso a `/mis-siniestros`
- Ver solo sus propios siniestros
- Pagar siniestros aprobados
- Ver estado de sus reclamaciones

## 🛡️ Protección de Rutas

### Rutas Protegidas por Rol

Las rutas de administrador están protegidas con `AuthGuard`:

```tsx
import { AuthGuard } from "@/components/auth-guard";

export default function AdminPage() {
    return (
        <AuthGuard requiredRole="admin">
            {/* Contenido solo para admins */}
        </AuthGuard>
    );
}
```

### Rutas Protegidas para Usuarios

Las rutas de usuario están protegidas en el layout:

```tsx
<UserLayout>
    {/* Contenido protegido para usuarios autenticados */}
</UserLayout>
```

## 📱 Flujo de Usuario

### Para Administradores

1. Ir a `/login`
2. Iniciar sesión con credenciales de admin
3. Redirige automáticamente a `/admin` o `/`
4. Acceso completo al panel administrativo

### Para Usuarios Comunes

1. Ir a `/login`
2. Iniciar sesión con credenciales de usuario
3. Redirige automáticamente a `/mis-siniestros`
4. Ver sus siniestros y pagar los aprobados

## 🔧 API Endpoints

### POST `/api/auth/login`
Autentica un usuario y crea una sesión.

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña"
}
```

**Response:**
```json
{
  "success": true,
  "usuario": {
    "_id": "...",
    "email": "usuario@example.com",
    "nombre": "Nombre Usuario",
    "rol": "user",
    "direccionWallet": "0x..."
  }
}
```

### POST `/api/auth/logout`
Cierra la sesión actual.

### GET `/api/auth/me`
Obtiene la información del usuario actual autenticado.

## 💡 Asociar Wallet a Usuario

Los usuarios pueden asociar su dirección de wallet Ethereum a su cuenta. Esto permite:

- Filtrar siniestros por dirección de wallet
- Pagar siniestros directamente desde su wallet

**Nota**: Actualmente, los siniestros se filtran por `direccionWallet`. Si un usuario no tiene wallet asociada, no verá siniestros.

## 🎨 Componentes

### `AuthGuard`
Componente que protege rutas según el rol:

```tsx
<AuthGuard requiredRole="admin" redirectTo="/login">
    {/* Contenido protegido */}
</AuthGuard>
```

### `UserLayout`
Layout específico para usuarios comunes con:
- Header con nombre de usuario
- Botón de logout
- Navegación simplificada

### `MainLayout`
Layout para administradores (existente) con:
- Sidebar completo
- Navegación administrativa
- Barra de búsqueda

## 🔒 Seguridad

- Contraseñas hasheadas con bcrypt (10 rounds)
- Sesiones almacenadas en cookies httpOnly
- Verificación de roles en cada request
- Protección de rutas a nivel de componente

## 📝 Próximos Pasos

1. **Registro de usuarios**: Crear endpoint y página de registro
2. **Recuperación de contraseña**: Implementar reset de contraseña
3. **Perfil de usuario**: Página para editar perfil y asociar wallet
4. **Notificaciones**: Sistema de notificaciones para cambios de estado
5. **Historial**: Ver historial completo de transacciones del usuario

## 🐛 Troubleshooting

### Error: "No hay sesión activa"
- Verifica que las cookies estén habilitadas
- Asegúrate de estar en el mismo dominio
- Revisa la configuración de cookies en producción

### Error: "Usuario no encontrado"
- Verifica que el usuario exista en MongoDB
- Asegúrate de que el campo `activo` sea `true`

### Los siniestros no aparecen para usuarios
- Verifica que el usuario tenga `direccionWallet` asociada
- Asegúrate de que los siniestros tengan el `solicitante` correcto
- La dirección debe coincidir exactamente (case-insensitive)

---

**Desarrollado para el Sistema de Reclamaciones de Seguros en Blockchain**

