# Cambios realizados - Corrección de feedback

## 1. Wireframes

Se ha documentado la estructura visual de la aplicación:
- Layout principal desktop (2 columnas)
- Layout móvil (1 columna)
- Componentes: tarjetas, modal, formulario
- Flujo de interacciones

## 2. Paleta de colores / Guía de estilos

Colores definidos:
- Marrón (brown) - color principal
- Coral (lightcoral) - secundario/gradientes
- Crema (#f5e6d3) - fondo
- Rosa (#ffb6c1) - clases
- Azul claro (#87ceeb) - actividades
- Verde claro - confirmaciones
- Coral - errores

## 3. Variables CSS
Archivo: `src/style.css`

```css
:root {
  --color-primario: brown;
  --color-secundario: lightcoral;
  --color-fondo: #f5e6d3;
  --color-superficie: #fffef8;
  --color-texto: #333;
  --color-exito: lightgreen;
  --color-error: lightcoral;
  --color-clase: #ffb6c1;
  --color-actividad: #87ceeb;
  --espaciado: 20px;
  --radio-borde: 8px;
}
```

## 4. Usabilidad - Sin alerts
Archivo: `src/main.js`

Antes:
```javascript
if (confirm('¿Eliminar este evento?')) { ... }
```

Ahora: Confirmación inline dentro de la tarjeta con botones "Sí" / "No"

## 5. Accesibilidad
Archivo: `index.html` y `src/style.css`

- Labels ocultos (`.sr-only`) para inputs
- `aria-label` en campos del formulario
- `aria-labelledby` en secciones

## Archivos modificados

- `src/style.css` (variables CSS + estilos confirmación)
- `src/main.js` (confirmación inline)
- `index.html` (accesibilidad)

        <section class="seccion-formulario" aria-labelledby="titulo-formulario">
        <h2 id="titulo-formulario">Registrar Actividad</h2>
        
        <label for="nombre-evento" class="sr-only">Nombre del evento</label>
        <input ... required>
        
        <select id="categoria-evento" aria-label="Tipo de evento">
        
        <input type="date" aria-label="Fecha del evento">
        <select id="hora-evento" aria-label="Hora del evento">
        etc...
- Mensaje de confirmación con aspa para cerrar o esperar 10 segundos
