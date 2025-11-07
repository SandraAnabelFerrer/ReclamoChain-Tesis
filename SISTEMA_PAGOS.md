# 💰 Sistema de Pagos - Documentación

## 📋 Descripción General

El sistema de pagos permite procesar automáticamente las reclamaciones aprobadas a través de dos métodos:

1. **Pago con MetaMask** (Descentralizado)
2. **Pago desde Contrato** (Automatizado)

## 🎯 Características Principales

### ✅ Métodos de Pago

#### 1. MetaMask (Recomendado para Administradores)

-   **Ventajas:**

    -   Mayor control sobre cada transacción
    -   Más descentralizado y transparente
    -   El administrador autoriza cada pago individualmente
    -   Ideal para demostrar conocimientos de Web3

-   **Proceso:**
    1. El administrador conecta su wallet de MetaMask
    2. Revisa el monto y beneficiario
    3. Confirma la transacción en MetaMask
    4. El smart contract procesa el pago
    5. Se registra el hash de la transacción

#### 2. Pago desde Contrato (Automatizado)

-   **Ventajas:**

    -   Proceso completamente automatizado
    -   No requiere intervención manual
    -   Más eficiente para múltiples pagos
    -   Fondos pre-depositados en el contrato

-   **Proceso:**
    1. El contrato verifica su balance
    2. Ejecuta la transacción automáticamente
    3. Transfiere ETH al beneficiario
    4. Actualiza el estado en la blockchain y MongoDB

## 🚀 Cómo Usar el Sistema

### Paso 1: Aprobar un Reclamo

```
1. Ir a Panel de Administración
2. Seleccionar un reclamo "Validado"
3. Hacer clic en "Aprobar"
4. Ingresar notas de aprobación
5. Confirmar aprobación
```

### Paso 2: Procesar el Pago

```
1. El reclamo aparece con estado "APROBADO"
2. Hacer clic en botón "Procesar Pago" 💰
3. Se abre el modal de pago con 2 opciones
```

### Paso 3: Elegir Método de Pago

#### Opción A: MetaMask

```
1. Clic en "Pagar con MetaMask"
2. Conectar wallet si no está conectada
3. Revisar monto y destinatario
4. Confirmar en MetaMask
5. Esperar confirmación de blockchain
6. ✅ Pago completado
```

#### Opción B: Contrato

```
1. Clic en "Pagar desde Contrato"
2. El sistema verifica balance
3. Procesa pago automáticamente
4. ✅ Pago completado
```

## 📊 Visualización de Pagos

### Página de Pagos (`/pagos`)

Accede a `/pagos` para ver:

-   ✅ **Pagos Completados**: Historial de todos los pagos
-   ⏳ **Pagos Pendientes**: Reclamos aprobados sin pagar
-   💰 **Balance del Contrato**: Fondos disponibles
-   📈 **Estadísticas**: Métricas de pagos

### Información Disponible

Cada pago muestra:

-   Número de siniestro
-   Beneficiario (dirección wallet)
-   Monto pagado en ETH
-   Fecha y hora del pago
-   Hash de transacción (enlace a Etherscan)
-   Tipo de siniestro

## 🔧 Configuración Técnica

### Variables de Entorno (.env.local)

```bash
# Blockchain
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_NETWORK=sepolia
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0x... # Para pagos automáticos desde contrato

# MongoDB
MONGODB_URI=mongodb+srv://...
```

### Smart Contract

El contrato incluye la función `procesarPago`:

```solidity
function procesarPago(uint256 _siniestroId)
    external
    payable
    soloAdministrador
    reclamoExiste(_siniestroId)
```

### API Endpoint

```typescript
POST /api/reclamos/[id]/pagar
Body: {
    metodoPago: "metamask" | "contrato",
    hashTransaccion?: string, // Si es MetaMask
    pagadoPor?: string // Dirección del pagador
}
```

## 🎨 Flujo Completo

```
1. Usuario crea reclamo
   ↓
2. Admin valida reclamo
   ↓
3. Admin aprueba reclamo
   ↓
4. Reclamo estado: APROBADO
   ↓
5. Admin procesa pago (MetaMask o Contrato)
   ↓
6. Transacción en blockchain
   ↓
7. Actualización en MongoDB
   ↓
8. Reclamo estado: PAGADO ✅
```

## 🔐 Seguridad

### Validaciones Implementadas

-   ✅ Solo administradores pueden procesar pagos
-   ✅ Verificación de estado (debe estar APROBADO)
-   ✅ Validación de balance del contrato
-   ✅ Registro de todas las transacciones
-   ✅ Historial de cambios en MongoDB

### Auditoría

Cada pago queda registrado con:

-   Hash de transacción en blockchain
-   Timestamp exacto
-   Dirección del pagador
-   Dirección del beneficiario
-   Monto exacto
-   Estado anterior y nuevo

## 📱 Interfaz de Usuario

### Componentes Creados

1. **PaymentModal**: Modal para seleccionar y procesar pagos
2. **PagosPage**: Página de historial de pagos
3. **AdminPanel**: Actualizado con botón de pago

### Características UI

-   🎨 Diseño moderno con Tailwind CSS
-   📱 Responsive (móvil y desktop)
-   🔔 Notificaciones en tiempo real
-   ⚡ Indicadores de carga
-   ✅ Confirmaciones visuales

## 🧪 Testing

### Probar Pago con MetaMask

1. Asegúrate de tener MetaMask instalado
2. Conecta a red Sepolia
3. Tener ETH de prueba en tu wallet
4. Aprobar un reclamo
5. Procesar pago con MetaMask

### Probar Pago desde Contrato

1. Depositar fondos en el contrato:

```javascript
// Enviar ETH al contrato
const tx = await wallet.sendTransaction({
    to: CONTRACT_ADDRESS,
    value: ethers.parseEther("1.0"),
});
```

2. Aprobar un reclamo
3. Procesar pago desde contrato

## 🎓 Para tu Tesis

### Ventajas de este Sistema

1. **Descentralización**: Uso de blockchain para pagos
2. **Transparencia**: Todas las transacciones auditables
3. **Automatización**: Reduce intervención manual
4. **Seguridad**: Smart contracts verificados
5. **Eficiencia**: Pagos instantáneos

### Puntos a Destacar

-   Implementación de Web3 con ethers.js
-   Integración MetaMask
-   Smart contracts en Solidity
-   Arquitectura híbrida (blockchain + MongoDB)
-   UX moderna y responsiva

## 📚 Recursos Adicionales

### Enlaces Útiles

-   [Etherscan Sepolia](https://sepolia.etherscan.io/)
-   [MetaMask Docs](https://docs.metamask.io/)
-   [Ethers.js Docs](https://docs.ethers.org/)
-   [Solidity Docs](https://docs.soliditylang.org/)

### Comandos Útiles

```bash
# Ver balance del contrato
npx hardhat run scripts/check-balance.js --network sepolia

# Depositar fondos
npx hardhat run scripts/deposit-funds.js --network sepolia

# Verificar contratos
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 🐛 Troubleshooting

### Error: "MetaMask no detectado"

**Solución**: Instala MetaMask desde [metamask.io](https://metamask.io/)

### Error: "Balance insuficiente"

**Solución**:

-   Para MetaMask: Obtener ETH de prueba de [Sepolia Faucet](https://sepoliafaucet.com/)
-   Para Contrato: Depositar fondos al contrato

### Error: "Reclamo debe estar aprobado"

**Solución**: Primero valida y luego aprueba el reclamo antes de intentar pagar

### Error: "Transaction failed"

**Solución**:

-   Verifica que tienes suficiente gas
-   Asegúrate de estar en la red correcta (Sepolia)
-   Revisa que el contrato tenga fondos

## 🎉 Características Futuras

Posibles mejoras:

-   [ ] Pagos programados
-   [ ] Múltiples tokens (USDC, USDT)
-   [ ] Sistema de firma múltiple
-   [ ] Notificaciones por email
-   [ ] Exportar reportes en PDF
-   [ ] Dashboard de analíticas avanzadas
-   [ ] Integración con oráculos (Chainlink)

---

**Desarrollado con ❤️ para tu tesis**

_Sistema de Reclamaciones de Seguros en Blockchain_
