// test_router.js - Prueba rápida en consola del navegador
console.log('🔗 Probando React Router...');

// Verificar que React Router está funcionando
if (typeof window !== 'undefined') {
    console.log('URL actual:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    
    // Probar navegación programática
    console.log('Para probar manualmente:');
    console.log('1. Ve a http://localhost:3000/login');
    console.log('2. Haz clic en "Regístrate aquí"');
    console.log('3. Deberías ir a http://localhost:3000/register');
    console.log('4. En register, haz clic en "Inicia sesión aquí"');
    console.log('5. Deberías volver a http://localhost:3000/login');
}
