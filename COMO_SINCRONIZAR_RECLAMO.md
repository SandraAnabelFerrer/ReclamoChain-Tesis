# 🔄 Sincronizar Reclamo desde Blockchain a MongoDB

## ✅ Reclamo creado en Blockchain

**ID:** 2217058678  
**Solicitante:** 0x914582B7f5eDCC4eE3950db39519Cb29265b4CAD  
**Descripción:** Reclamo de prueba - Daños en vehículo  
**Monto:** 0.001 ETH  
**Estado:** Creado  
**Hash TX:** [Ver en Etherscan](https://sepolia.etherscan.io/tx/0x33450ba085ce96a52a535ae239b2374a02a673487283a37e894e1a41c18e80c4)

---

## 📝 Pasos para sincronizar a MongoDB

### Opción 1: Desde la Consola del Navegador (RECOMENDADO)

1. **Abre tu aplicación en el navegador:**

    ```
    http://localhost:3000
    ```

2. **Abre la Consola del Navegador:**

    - Chrome/Edge: `F12` o `Ctrl+Shift+J`
    - Firefox: `F12` o `Ctrl+Shift+K`

3. **Pega y ejecuta este código:**

```javascript
// Datos del reclamo en blockchain
const reclamoData = {
    siniestroId: 2217058678,
    solicitante: "0x914582B7f5eDCC4eE3950db39519Cb29265b4CAD",
    descripcion: "Reclamo de prueba - Daños en vehículo",
    monto: 0.001,
    tipoSiniestro: "Reclamo importado desde blockchain",
    numeroPoliza: "POL-SYNC-2217058678",
    documentos: [],
    ubicacion: "",
};

// Sincronizar a MongoDB
fetch("/api/reclamos/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reclamoData),
})
    .then((res) => res.json())
    .then((data) => {
        if (data.success) {
            console.log("✅ Reclamo sincronizado exitosamente!");
            console.log("📊 Datos:", data.data);
            console.log("\n🎯 SIGUIENTE PASO:");
            console.log("   1. Ve a /admin");
            console.log("   2. Busca el reclamo ID: 2217058678");
            console.log("   3. Valida → Aprueba → Procesa el pago 💰");
            alert("✅ Reclamo sincronizado! Ve a /admin para procesarlo.");
        } else {
            console.error("❌ Error:", data.error || data.message);
            if (data.message && data.message.includes("ya está registrado")) {
                console.log("✅ El reclamo ya existe en MongoDB!");
                alert("✅ El reclamo ya existe! Ve a /admin");
            }
        }
    })
    .catch((error) => {
        console.error("❌ Error de conexión:", error);
        alert("Error: " + error.message);
    });
```

---

### Opción 2: Verificar si ya existe en MongoDB

```javascript
// Verificar si el reclamo ya existe
fetch("/api/reclamos")
    .then((res) => res.json())
    .then((data) => {
        const existe = data.data.find((r) => r.siniestroId === 2217058678);
        if (existe) {
            console.log("✅ Reclamo ENCONTRADO en MongoDB:");
            console.log(existe);
        } else {
            console.log("❌ Reclamo NO encontrado en MongoDB");
            console.log(
                "💡 Ejecuta el código de la Opción 1 para sincronizarlo"
            );
        }
    });
```

---

## 🧪 Flujo Completo de Prueba

Una vez sincronizado el reclamo a MongoDB, sigue estos pasos:

### 1️⃣ **Validar el Reclamo** (Admin)

-   Ve a http://localhost:3000/admin
-   Busca el reclamo ID: **2217058678**
-   Haz clic en "Validar"

### 2️⃣ **Aprobar el Reclamo** (Admin)

-   Haz clic en "Aprobar"
-   Agrega notas (opcional): "Reclamo de prueba aprobado"

### 3️⃣ **Procesar el Pago** (Admin con MetaMask)

-   Haz clic en "Procesar Pago"
-   Selecciona método de pago: **"Pagar con MetaMask"**
-   Confirma la transacción en MetaMask
-   Monto a pagar: **0.001 ETH**

### 4️⃣ **Verificar el Pago**

-   Ve a http://localhost:3000/pagos
-   Deberías ver el reclamo **2217058678** con estado "Pagado"
-   Verifica la transacción en [Sepolia Etherscan](https://sepolia.etherscan.io/)

---

## 🔧 Troubleshooting

### Error: "El reclamo ya está registrado"

✅ **Perfecto!** El reclamo ya existe en MongoDB. Ve directamente a `/admin` y procésalo.

### Error: "Reclamo NO EXISTE en blockchain"

❌ El ID es incorrecto. Usa el ID correcto: **2217058678**

### Error de conexión

1. Asegúrate de que el servidor Next.js esté corriendo: `npm run dev`
2. Verifica que estés en http://localhost:3000
3. Revisa que MongoDB esté conectado (chequea la consola del servidor)

---

## 📊 Estado Actual

-   ✅ **Blockchain:** Reclamo creado exitosamente (ID: 2217058678)
-   ⏳ **MongoDB:** Pendiente de sincronización
-   ⏳ **Sistema de Pagos:** Listo para probar una vez sincronizado

---

## 🎯 Próximos Pasos Recomendados

1. **Sincroniza** el reclamo usando el código de JavaScript arriba
2. **Prueba el flujo completo:** Validar → Aprobar → Pagar
3. **Verifica** que el pago se registre correctamente en `/pagos`
4. **Revisa** la transacción en Etherscan

---

## 💡 Importante

Este es un **reclamo de prueba** creado específicamente para validar que:

-   ✅ Los reclamos existen tanto en blockchain como en MongoDB
-   ✅ El sistema de pagos funciona correctamente
-   ✅ MetaMask se integra bien con el flujo de pagos

**El problema original** (reclamos solo en MongoDB sin blockchain) queda resuelto con este nuevo flujo. Para nuevos reclamos, asegúrate de que se creen **primero en blockchain** y luego se sincronicen a MongoDB.
