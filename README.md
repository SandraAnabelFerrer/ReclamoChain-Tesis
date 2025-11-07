# 🏥 Sistema de Reclamaciones de Seguros en Blockchain

Sistema descentralizado para la gestión automatizada de reclamaciones de seguros utilizando tecnología blockchain (Ethereum) y MongoDB.

## 🌟 Características Principales

-   ✅ **Gestión de Reclamaciones**: Crear, validar, aprobar/rechazar reclamos
-   💰 **Sistema de Pagos**: Procesamiento de pagos con MetaMask o desde el contrato
-   📊 **Estadísticas en Tiempo Real**: Dashboard con métricas del sistema
-   🔐 **Blockchain**: Registro inmutable en Ethereum (Sepolia Testnet)
-   💾 **MongoDB**: Base de datos para datos adicionales y búsquedas rápidas
-   🎨 **UI Moderna**: Interfaz responsive con Next.js 14 y Tailwind CSS

## 🚀 Inicio Rápido

### Prerequisitos

```bash
Node.js >= 18.x
npm o yarn
MongoDB (local o Atlas)
MetaMask (extensión de navegador)
```

### Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd mabel-tesis
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env.local`:

```env
# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK=sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0x... # Tu private key para transacciones

# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/seguros
```

4. **Compilar y desplegar contratos** (opcional, si vas a desplegar)

```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

5. **Ejecutar el proyecto**

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 💰 Sistema de Pagos

El sistema incluye **dos métodos de pago**:

### 1. Pago con MetaMask (Descentralizado)

-   El administrador paga desde su wallet personal
-   Mayor control y transparencia
-   Ideal para tesis y demostración de Web3

### 2. Pago desde Contrato (Automatizado)

-   Fondos pre-depositados en el contrato
-   Procesamiento automático
-   Mayor eficiencia

📖 **[Ver Documentación Completa del Sistema de Pagos →](./SISTEMA_PAGOS.md)**

### Comandos Útiles para Pagos

```bash
# Verificar balance del contrato
npx hardhat run scripts/check-balance.js --network sepolia

# Depositar fondos al contrato (0.1 ETH por defecto)
npx hardhat run scripts/deposit-funds.js --network sepolia

# Depositar cantidad personalizada
DEPOSIT_AMOUNT=0.5 npx hardhat run scripts/deposit-funds.js --network sepolia
```

## 📁 Estructura del Proyecto

```
├── app/                    # Páginas Next.js 14 (App Router)
│   ├── api/               # API Routes
│   │   ├── reclamos/      # Endpoints de reclamos
│   │   │   └── [id]/
│   │   │       ├── aprobar/
│   │   │       ├── rechazar/
│   │   │       ├── validar/
│   │   │       └── pagar/    # ← Endpoint de pagos
│   │   └── estadisticas/  # Estadísticas del sistema
│   ├── reclamos/          # Página de reclamos
│   ├── pagos/             # ← Página de historial de pagos
│   ├── estadisticas/      # Página de estadísticas
│   └── admin/             # Panel administrativo
├── components/            # Componentes React
│   ├── admin-panel.tsx    # Panel de administración
│   ├── payment-modal.tsx  # ← Modal de pagos
│   └── ui/                # Componentes UI (shadcn)
├── contracts/             # Smart Contracts (Solidity)
│   └── ReclamacionesSeguros.sol
├── lib/                   # Utilidades
│   ├── contract.ts        # Configuración de ethers.js
│   ├── reclamoService.ts  # Servicio MongoDB
│   └── mongodb.ts         # Conexión MongoDB
├── models/                # Modelos de datos
│   └── reclamo.ts
└── scripts/               # Scripts Hardhat
    ├── deploy.js          # Desplegar contrato
    ├── check-balance.js   # ← Verificar balance
    └── deposit-funds.js   # ← Depositar fondos
```

## 🎯 Flujo de Trabajo

```
1. Usuario crea reclamo
   ↓
2. Transacción en blockchain (Ethereum)
   ↓
3. Registro en MongoDB
   ↓
4. Admin valida reclamo
   ↓
5. Admin aprueba/rechaza
   ↓
6. [Si aprobado] Admin procesa pago 💰
   ↓
7. Pago ejecutado en blockchain
   ↓
8. Estado actualizado a PAGADO ✅
```

## 🔧 Tecnologías Utilizadas

### Frontend

-   **Next.js 14**: Framework React con App Router
-   **TypeScript**: Tipado estático
-   **Tailwind CSS**: Estilos utility-first
-   **shadcn/ui**: Componentes UI
-   **ethers.js**: Interacción con blockchain

### Backend

-   **Next.js API Routes**: Endpoints serverless
-   **MongoDB**: Base de datos NoSQL
-   **Mongoose**: ODM para MongoDB

### Blockchain

-   **Solidity**: Smart contracts
-   **Hardhat**: Framework de desarrollo
-   **Ethereum (Sepolia)**: Red de prueba
-   **MetaMask**: Wallet de usuario

## 📊 Características del Sistema

### Panel de Administración

-   Validar reclamos pendientes
-   Aprobar/rechazar reclamos
-   Procesar pagos (MetaMask o Contrato)
-   Ver estadísticas en tiempo real

### Página de Pagos (`/pagos`)

-   Historial de pagos completados
-   Pagos pendientes
-   Balance del contrato
-   Enlaces a Etherscan

### Estadísticas

-   Total de reclamos
-   Distribución por estado
-   Montos totales
-   Estadísticas blockchain

## 🔐 Seguridad

-   ✅ Control de acceso (solo admins)
-   ✅ Validación de estados
-   ✅ Registro inmutable en blockchain
-   ✅ Historial de cambios en MongoDB
-   ✅ Verificación de balance antes de pagos

## 🧪 Testing

### Pruebas Locales

```bash
# Instalar Hardhat local
npm install --save-dev hardhat

# Correr tests
npx hardhat test

# Iniciar nodo local
npx hardhat node

# Desplegar en local
npx hardhat run scripts/deploy.js --network localhost
```

### Obtener ETH de Prueba

-   [Sepolia Faucet](https://sepoliafaucet.com/)
-   [Alchemy Faucet](https://www.alchemy.com/faucets/ethereum-sepolia)

## 📖 Documentación Adicional

-   [Sistema de Pagos](./SISTEMA_PAGOS.md) - Guía completa del sistema de pagos
-   [Smart Contract](./contracts/ReclamacionesSeguros.sol) - Código del contrato
-   [API Reference](./app/api/) - Documentación de endpoints

## 🎓 Para la Tesis

Este proyecto demuestra:

-   ✅ Integración blockchain con aplicación web moderna
-   ✅ Smart contracts para automatización de procesos
-   ✅ Arquitectura híbrida (blockchain + base de datos tradicional)
-   ✅ Implementación de pagos descentralizados
-   ✅ UI/UX moderna y responsive
-   ✅ Seguridad y auditoría de transacciones

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es para fines educativos (Tesis).

## 👨‍💻 Autor

**Mabel - Tesis de Grado**

---

⭐ Si te gusta este proyecto, dale una estrella!

**Desarrollado con ❤️ usando Next.js, Ethereum y MongoDB**
