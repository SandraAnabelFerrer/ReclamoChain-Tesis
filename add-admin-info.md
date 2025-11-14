# Información del Script `add-admin.js`

## Descripción

Este script permite agregar un nuevo administrador al contrato inteligente `ReclamacionesSeguros`. Utiliza la librería `ethers.js` para interactuar con el contrato desplegado en la red Ethereum.

---

## Requisitos Previos

1. **Archivo `.env.local`**:

    - Debe contener la dirección del contrato bajo la variable `CONTRACT_ADDRESS` o `NEXT_PUBLIC_CONTRACT_ADDRESS`.
    - Debe incluir la clave privada del propietario del contrato bajo la variable `PRIVATE_KEY`.

2. **Instalación de Dependencias**:

    - Asegúrate de haber instalado las dependencias necesarias ejecutando:
        ```bash
        npm install
        ```

3. **Red de Ejecución**:
    - Configura la red en el archivo `hardhat.config.js` para que apunte a la red deseada (por ejemplo, `sepolia`).

---

## Pasos del Script

1. **Carga de Variables de Entorno**:

    - Se cargan las variables desde el archivo `.env.local`.

2. **Validación de la Dirección del Contrato**:

    - Verifica que la dirección del contrato esté definida en las variables de entorno.

3. **Definición del Nuevo Administrador**:

    - La dirección del nuevo administrador se define directamente en el script:
        ```javascript
        const newAdmin = "0x84B402a8AA34fAa78a1EbfdeBCAa803F4f9C6a47";
        ```

4. **Obtención del Contrato**:

    - Se utiliza `ethers.getContractFactory` para obtener una instancia del contrato.

5. **Verificación de Permisos**:

    - Verifica si la cuenta que ejecuta el script es el propietario del contrato.

6. **Verificación de Admin Existente**:

    - Comprueba si la dirección ya es un administrador antes de intentar agregarla.

7. **Transacción para Agregar Administrador**:

    - Envía la transacción para agregar al nuevo administrador.
    - Espera la confirmación de la transacción.

8. **Verificación Final**:
    - Confirma que la dirección se agregó correctamente como administrador.

---

## Mensajes de Consola

-   **Éxito**:

    ```
    ✅ ¡Administrador agregado exitosamente!
    📊 Detalles:
       Block: <número de bloque>
       Gas usado: <gas usado>
       Hash: <hash de la transacción>
    ✅ Verificación: Es administrador ✓
    ```

-   **Error**:
    ```
    ❌ Error: Ownable: caller is not the owner
    💡 La cuenta que ejecuta el script debe ser el PROPIETARIO del contrato.
       Verifica que PRIVATE_KEY en .env.local sea la del propietario.
    ```

---

## Comando para Ejecutar el Script

```bash
npx hardhat run scripts/add-admin.js --network sepolia
```

---

## Notas Adicionales

-   **Siguiente Paso**:

    -   Recarga la aplicación en el navegador.
    -   Intenta procesar un reclamo para verificar que MetaMask solicite la confirmación de la transacción.

-   **Consideraciones de Seguridad**:
    -   Asegúrate de que la clave privada en `.env.local` esté protegida y no se comparta públicamente.

---

## Código del Script

```javascript
// ...existing code...
const esAdmin = await contrato.administradores(newAdmin);

if (esAdmin) {
    console.log("✅ La dirección YA ES administrador");
    return;
}

console.log("📤 Enviando transacción para agregar administrador...");
const tx = await contrato.agregarAdministrador(newAdmin);

console.log("⏳ Hash:", tx.hash);
console.log("⏳ Esperando confirmación...\n");

const receipt = await tx.wait();

console.log("✅ ¡Administrador agregado exitosamente!");
console.log("📊 Detalles:");
console.log("   Block:", receipt.blockNumber);
console.log("   Gas usado:", receipt.gasUsed.toString());
console.log("   Hash:", receipt.hash);

// Verificar
const esAdminAhora = await contrato.administradores(newAdmin);
console.log(
    "\n✅ Verificación:",
    esAdminAhora ? "Es administrador ✓" : "NO es administrador ✗"
);

console.log("\n📌 SIGUIENTE PASO:");
console.log("   1. Recarga tu aplicación en el navegador");
console.log("   2. Intenta procesar el pago del reclamo 2217058678");
console.log("   3. MetaMask debería aparecer para confirmar la transacción");
// ...existing code...
```

---

## Información del Contexto

-   **Archivo**: `scripts/add-admin.js`
-   **Último Comando Ejecutado**: `npx hardhat run scripts/add-admin.js --network sepolia`
-   **Estado de Salida**: `0` (Éxito)

---

## Fecha de Generación

-   **Fecha**: 14 de noviembre de 2025
