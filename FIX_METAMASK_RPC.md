# 🔧 Solución al Error "missing trie node" en MetaMask

## ❌ Error Actual

```
MetaMask - RPC Error: Internal JSON-RPC error.
missing trie node ... state is not available, not found
```

## 📋 Causa

El RPC que MetaMask está usando **NO está sincronizado** con los bloques recientes de Sepolia. Por eso no puede leer el estado del contrato recién desplegado.

---

## ✅ Solución: Cambiar el RPC de MetaMask

### Paso 1: Abre la configuración de redes en MetaMask

1. **Abre MetaMask** (extensión del navegador)
2. **Haz clic en el selector de red** (arriba, donde dice "Sepolia test network")
3. **Haz clic en "Add network"** o **"Settings"**
4. Busca **"Sepolia"** en la lista de redes

### Paso 2: Edita la red Sepolia

1. **Haz clic en los 3 puntos** junto a "Sepolia test network"
2. **Selecciona "Edit"** o **"Settings"**

### Paso 3: Cambia el RPC URL

**Opción 1 (RECOMENDADO):** RPC público de Sepolia

```
https://rpc.sepolia.org
```

**Opción 2:** RPC de PublicNode

```
https://ethereum-sepolia.publicnode.com
```

**Opción 3:** Tu Infura RPC (si tienes cuenta)

```
https://sepolia.infura.io/v3/bedfbb3adeff48e3a8744a807c4ada09
```

### Paso 4: Guarda y prueba

1. **Haz clic en "Save"**
2. **Asegúrate de que esté seleccionada la red Sepolia**
3. **Recarga tu aplicación** (F5)
4. **Intenta procesar el pago de nuevo**

---

## 🎯 Verificar que funciona

Después de cambiar el RPC, deberías poder:

1. ✅ Conectar MetaMask sin errores
2. ✅ Ver el popup de MetaMask al hacer clic en "Procesar Pago"
3. ✅ Firmar la transacción sin errores de RPC

---

## 🔍 Si el error persiste

Si después de cambiar el RPC **aún ves el error**, intenta:

### Opción A: Limpiar la caché de MetaMask

1. Configuración de MetaMask > Avanzado
2. **"Clear activity tab data"** o **"Reset account"**
3. ⚠️ Esto NO borrará tus fondos, solo el historial de transacciones

### Opción B: Esperar unos minutos

-   A veces el contrato recién desplegado necesita unos minutos para propagarse
-   Espera 5-10 minutos e intenta de nuevo

### Opción C: Usar otro RPC

-   Prueba los 3 RPC mencionados arriba
-   Algunos pueden estar más sincronizados que otros

---

## 📊 Estado Actual del Sistema

-   ✅ **Contrato desplegado:** `0xdD89f538b34B9Bf62d4413Ee8FFa6F94C893497A`
-   ✅ **Reclamo creado:** ID `2873275184`
-   ✅ **Estado del reclamo:** Aprobado (verificado con script)
-   ✅ **Código frontend:** Actualizado para evitar validaciones que causen error
-   ⚠️ **Problema:** MetaMask usando RPC no sincronizado

Una vez cambies el RPC, todo debería funcionar correctamente! 🚀
