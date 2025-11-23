# 🏥 Sistema de Reclamaciones de Seguros en Blockchain  
### Tesina – Universidad Champagnat  
**Autora: Sandra Anabel Ferrer**

Sistema descentralizado para la gestión automatizada de reclamaciones de seguros utilizando **Blockchain (Ethereum Sepolia)**, **Next.js**, **Node.js**, y **MongoDB**.  
El objetivo es modernizar el proceso de reclamos mediante contratos inteligentes, asegurando transparencia, trazabilidad y automatización del flujo completo.

---

## 🌟 Características Principales

-   ✅ **Gestión completa de Reclamos:** Crear, validar, aprobar, rechazar y pagar reclamos.
-   💰 **Sistema de Pagos Web3:** Pagos con MetaMask o directamente desde el contrato.
-   📊 **Dashboard en Tiempo Real:** Estadísticas del sistema desde APIs propias.
-   🔐 **Blockchain:** Registro inmutable en Ethereum (Sepolia Testnet).
-   💾 **MongoDB + Mongoose:** Base de datos para búsquedas rápidas e historial.
-   🎨 **Interfaz Moderna:** Construida con Next.js 14, React, Tailwind CSS y shadcn/ui.

---

## 🚀 Inicio Rápido

### 📌 Prerequisitos

```bash
Node.js >= 18
npm o yarn
MongoDB (local o Atlas)
MetaMask (extensión del navegador)
```

---

## 🔧 Instalación

### 1. **Clonar el repositorio**

```bash
git clone https://github.com/SandraAnabelFerrer/ReclamoChain-Tesis.git
cd ReclamoChain-Tesis
```

### 2. **Instalar dependencias**

```bash
npm install
```

### 3. **Configurar variables de entorno**

Crear archivo **`.env.local`** en la raíz del proyecto:

```env
# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK=sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/TU_INFURA_KEY
PRIVATE_KEY=0x...  # Tu private key para transacciones

# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/seguros
```

---

## 📦 Contratos Inteligentes

### Compilar contrato

```bash
npx hardhat compile
```

### Desplegar contrato en Sepolia (opcional)

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

---

## ▶️ Ejecutar el Proyecto

```bash
npm run dev
```

Luego abrir:  
👉 http://localhost:3000

---

# 💰 Sistema de Pagos Web3

El sistema cuenta con **dos modos de pago**:

---

### 🔹 1. Pago con MetaMask (Descentralizado)

- El administrador paga desde su propia wallet.  
- Muestra transacción en MetaMask y luego en Etherscan.  
- Ideal para demostración de la tesina.

---

### 🔹 2. Pago desde el Contrato (Automatizado)

- Se depositan fondos en el contrato previamente.  
- El contrato ejecuta el pago.  
- Ideal para automatización total.

---

### 🔧 Comandos Útiles

```bash
# Consultar balance del contrato
npx hardhat run scripts/check-balance.js --network sepolia

# Depositar 0.1 ETH
npx hardhat run scripts/deposit-funds.js --network sepolia

# Depositar monto personalizado
DEPOSIT_AMOUNT=0.5 npx hardhat run scripts/deposit-funds.js --network sepolia
```

---
---

## 🖼️ Capturas del Sistema

A continuación se muestran las principales vistas del sistema desarrollado, incluyendo administración de reclamos, gestión de usuarios, estadísticas, flujo de pagos y la pantalla principal.

### 📌 Pantalla Principal

![Pantalla Principal](capturas/pantalla-principal.png)


---

### 📊 Estadísticas del Sistema

Vista del dashboard con métricas clave: total de reclamos, distribución por estado, montos aprobados, etc.

![Estadísticas](capturas/estadisticas.png)

---

### 📝 Gestión de Reclamos

Interfaz administrativa donde se validan, aprueban y rechazan reclamos.  
Incluye acciones Web3 con MetaMask.

![Gestión de Reclamos](capturas/gestion-reclamaciones.png)

---

### 👥 Gestión de Usuarios / Administradores

Panel para agregar o remover administradores autorizados.

![Gestión de Usuarios](capturas/gestion-usuarios.png)

---

### 💰 Historial de Pagos

Lista de transacciones, pagos completados y estado final del proceso.

![Historial de Pagos](capturas/historial-pagos.png)

---


# 📁 Estructura del Proyecto

```
├── app/                     # Next.js (App Router)
│   ├── api/                 # API Routes
│   │   ├── reclamos/        # Endpoints de reclamos
│   │   │   └── [id]/
│   │   └── estadisticas/    # Dashboard
│   ├── reclamos/            # Página de reclamos
│   ├── pagos/               # Página de pagos
│   └── admin/               # Panel administrativo
│
├── components/              # Componentes UI
│   ├── admin-panel.tsx
│   ├── payment-modal.tsx
│   └── ui/
│
├── contracts/               # Smart Contracts (Solidity)
│   └── ReclamacionesSeguros.sol
│
├── lib/                     # Lógica de negocio
│   ├── contract.ts
│   ├── reclamoService.ts
│   └── mongodb.ts
│
├── models/                  # Modelos de MongoDB
│   └── reclamo.ts
│
└── scripts/                 # Scripts Hardhat
    ├── deploy.js
    ├── check-balance.js
    └── deposit-funds.js
```

---

# 🎯 Flujo de Trabajo

```
1. Usuario crea reclamo
2. Se registra en Blockchain (Ethereum)
3. Se guarda en MongoDB
4. Administrador valida el reclamo
5. Aprueba o rechaza
6. [Si aprobado] Ejecuta pago (MetaMask o contrato)
7. Blockchain actualiza transacción
8. Sistema cambia estado a PAGADO
```

---

# 🔐 Seguridad

-   Control de acceso para administradores.
-   Validación estricta de estados.
-   Registro inmutable en blockchain.
-   Historial en MongoDB.
-   Evita operaciones inválidas (doble pago, estados incorrectos, etc.).

---

# 🧪 Testing (Opcional)

```bash
# Instalar Hardhat
npm install --save-dev hardhat

# Ejecutar tests
npx hardhat test

# Nodo local Hardhat
npx hardhat node

# Desplegar en localhost
npx hardhat run scripts/deploy.js --network localhost
```

---

# 💡 Obtener ETH de Prueba

- https://sepoliafaucet.com  
- https://www.alchemy.com/faucets/ethereum-sepolia

---

# 🎓 Relevancia para la Tesina

Este proyecto demuestra:

-   ✔ Integración Web3 + Aplicación moderna  
-   ✔ Automatización mediante contratos inteligentes  
-   ✔ Uso real de Ethereum y MetaMask  
-   ✔ Arquitectura híbrida (blockchain + base de datos)  
-   ✔ Pagos descentralizados  
-   ✔ Seguridad y trazabilidad  
-   ✔ Interfaz profesional con Next.js  

---

# 👩‍💻 Autora

**Sandra Anabel Ferrer**  
Tesina – Universidad Champagnat  
Mendoza, Argentina  

---

⭐ *Si este proyecto te resultó útil, podés dejar una estrella en GitHub.*

**Desarrollado con ❤️ usando Next.js, Ethereum, Hardhat y MongoDB**
