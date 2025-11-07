// Script para verificar la configuración actual del contrato
// Ejecutar en la consola del navegador en http://localhost:3000

console.log("🔍 Verificando configuración del contrato...\n");

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

console.log("📍 Contract Address desde .env:", contractAddress);
console.log("\n⚠️  Si esto muestra la dirección ANTIGUA, necesitas:");
console.log("   1. Detener el servidor Next.js (Ctrl+C)");
console.log("   2. Ejecutar: npm run dev");
console.log("   3. Recargar la página");

console.log("\n✅ Dirección CORRECTA del nuevo contrato:");
console.log("   0xdD89f538b34B9Bf62d4413Ee8FFa6F94C893497A");

console.log("\n❌ Dirección ANTIGUA del contrato (NO usar):");
console.log("   0xC32fD5E99ED8180aA3Bf799C4f37cbD88ce2dA8C");

if (contractAddress === "0xdD89f538b34B9Bf62d4413Ee8FFa6F94C893497A") {
    console.log("\n🎉 ¡CONFIGURACIÓN CORRECTA! Puedes continuar.");
} else {
    console.log("\n⚠️  CONFIGURACIÓN INCORRECTA - REINICIA EL SERVIDOR");
}
