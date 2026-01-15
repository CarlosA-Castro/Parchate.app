// diagnóstico.js - Ejecutar en consola del navegador
console.log('🩺 Diagnóstico de React Router');

// Verificar que React Router esté funcionando
console.log('1. window.ReactRouter:', window.ReactRouter || 'No disponible');
console.log('2. window.ReactRouterDOM:', window.ReactRouterDOM || 'No disponible');

// Verificar enlaces en la página
const links = document.querySelectorAll('a, [href], [to]');
console.log('3. Enlaces encontrados:', links.length);

links.forEach((link, i) => {
  console.log(   ., {
    text: link.textContent.trim(),
    href: link.getAttribute('href'),
    to: link.getAttribute('to'),
    tag: link.tagName,
    onclick: link.onclick ? 'Sí' : 'No'
  });
});

// Probar navegación programática
console.log('4. Para probar manualmente:');
console.log('   - Ejecuta en consola: window.location.href = "/register"');
console.log('   - O usa React Router: window.history.pushState({}, "", "/register")');

// Verificar si hay errores en consola
console.log('5. Errores en consola:');
try {
  // Intenta crear un Link de React
  const React = window.React;
  const ReactRouterDOM = window.ReactRouterDOM;
  if (React && ReactRouterDOM) {
    console.log('   ✅ React y React Router disponibles');
  }
} catch (error) {
  console.log('   ❌ Error:', error.message);
}
