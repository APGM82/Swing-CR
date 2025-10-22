import './style.css'

// Estado simple de la aplicación
let events = JSON.parse(localStorage.getItem('swingEvents')) || [];

// Guardar eventos en localStorage
function saveEvents() {
  localStorage.setItem('swingEvents', JSON.stringify(events));
}

// Inicializar aplicación
function init() {
  setupEventListeners();
  renderEvents();
}

// Configurar event listeners
function setupEventListeners() {
  const form = document.getElementById('event-form');
  const categorySelect = document.getElementById('event-category');
  
  form.addEventListener('submit', handleSubmit);
  categorySelect.addEventListener('change', updateLocationOptions);
}

// Actualizar opciones de ubicación según categoría
function updateLocationOptions() {
  const category = document.getElementById('event-category').value;
  const locationSelect = document.getElementById('event-location');
  
  // Mostrar/ocultar campos específicos
  const claseFields = document.getElementById('clase-fields');
  const eventoFields = document.getElementById('evento-fields');
  
  claseFields.style.display = 'none';
  eventoFields.style.display = 'none';
  
  // Limpiar opciones existentes
  locationSelect.innerHTML = '';
  
  if (!category) {
    locationSelect.disabled = true;
    locationSelect.innerHTML = '<option value="">Primero selecciona una categoría</option>';
    return;
  }
  
  locationSelect.disabled = false;
  locationSelect.innerHTML = '<option value="">Selecciona ubicación</option>';
  
  if (category === 'clase') {
    // Mostrar campos específicos de clase
    claseFields.style.display = 'block';
    
    // Solo salas para clases
    const classSalas = ['Be Hopper', 'New Orleans', 'Savoy'];
    classSalas.forEach(sala => {
      const option = document.createElement('option');
      option.value = sala;
      option.textContent = sala;
      locationSelect.appendChild(option);
    });
  } else if (category === 'evento') {
    // Mostrar campos específicos de evento
    eventoFields.style.display = 'block';
    
    // Todas las ubicaciones para eventos
    const allLocations = [
      'Antiguo Casino de Ciudad Real',
      'Parque de Gasset', 
      'Prado',
      'Be Hopper',
      'New Orleans',
      'Savoy'
    ];
    allLocations.forEach(location => {
      const option = document.createElement('option');
      option.value = location;
      option.textContent = location;
      locationSelect.appendChild(option);
    });
  }
}

// Manejar envío del formulario
function handleSubmit(e) {
  e.preventDefault();
  
  const category = document.getElementById('event-category').value;
  
  const newEvent = {
    id: Date.now(),
    name: document.getElementById('event-name').value,
    category: category,
    date: document.getElementById('event-date').value,
    time: document.getElementById('event-time').value,
    location: document.getElementById('event-location').value
  };
  
  // Agregar campos específicos según el tipo
  if (category === 'clase') {
    newEvent.profesores = document.getElementById('profesores').value;
    newEvent.estilo = document.getElementById('estilo').value;
    newEvent.nivel = document.getElementById('nivel').value;
  } else if (category === 'evento') {
    newEvent.banda = document.getElementById('banda').value;
    newEvent.profesores = document.getElementById('profesores-evento').value;
    newEvent.estilo = document.getElementById('estilo-evento').value;
    newEvent.descripcion = document.getElementById('descripcion').value;
  }
  
  // Validar ubicación según tipo de evento
  const locationError = validateEventLocation(newEvent);
  if (locationError) {
    alert(locationError);
    return;
  }
  
  // Validar conflicto de ubicación y horario
  const conflict = checkLocationConflict(newEvent);
  if (conflict) {
    alert(`Conflicto de ubicación: Ya existe "${conflict.name}" en ${conflict.location} el ${formatDate(conflict.date)} a las ${conflict.time}`);
    return;
  }
  
  events.push(newEvent);
  saveEvents();
  
  // Limpiar formulario
  e.target.reset();
  updateLocationOptions(); // Resetear campos condicionales
  
  // Actualizar lista
  renderEvents();
}

// Validar ubicación según tipo de evento
function validateEventLocation(newEvent) {
  const classSalas = ['Be Hopper', 'New Orleans', 'Savoy'];
  const eventLocations = ['Antiguo Casino de Ciudad Real', 'Parque de Gasset', 'Prado'];
  
  // Validar horarios del festival
  const timeError = validateEventTime(newEvent);
  if (timeError) {
    return timeError;
  }
  
  // Si es una clase, debe estar en las salas específicas
  if (newEvent.category === 'clase' && !classSalas.includes(newEvent.location)) {
    return `Las clases solo pueden realizarse en: ${classSalas.join(', ')}`;
  }
  
  // Si es evento en sala de clases, verificar que no haya clases en ese horario
  if (newEvent.category === 'evento' && classSalas.includes(newEvent.location)) {
    const classInSala = events.find(event => 
      event.category === 'clase' &&
      event.location === newEvent.location &&
      event.date === newEvent.date &&
      event.time === newEvent.time
    );
    
    if (classInSala) {
      return `No se puede usar ${newEvent.location}: hay una clase programada ("${classInSala.name}") en ese horario`;
    }
  }
  
  return null; // Sin errores
}

// Validar horarios del festival
function validateEventTime(newEvent) {
  const eventDate = newEvent.date;
  const eventTime = newEvent.time;
  
  // Viernes: desde las 20:00 hasta las 24:00
  if (eventDate === '2026-10-23') {
    if (eventTime < '20:00' || eventTime > '24:00') {
      return `El viernes las actividades son de 20:00 a 24:00`;
    }
  }
  
  // Sábado: de 20:00 a 24:00
  if (eventDate === '2026-10-24') {
    if (eventTime < '20:00' || eventTime > '24:00') {
      return `El sábado las actividades son de 20:00 a 24:00`;
    }
  }
  
  // Domingo: de 20:00 a 24:00
  if (eventDate === '2026-10-25') {
    if (eventTime < '20:00' || eventTime > '24:00') {
      return `El domingo las actividades son de 20:00 a 24:00`;
    }
  }
  
  return null; // Sin errores
}

// Verificar conflictos de ubicación y horario
function checkLocationConflict(newEvent) {
  return events.find(existingEvent => 
    existingEvent.location === newEvent.location &&
    existingEvent.date === newEvent.date &&
    existingEvent.time === newEvent.time
  );
}

// Renderizar lista de eventos
function renderEvents() {
  const eventsList = document.getElementById('events-list');
  
  if (events.length === 0) {
    eventsList.innerHTML = '<p class="empty">No hay eventos registrados</p>';
    return;
  }
  
  // Ordenar eventos por fecha y hora
  const sortedEvents = events.sort((a, b) => 
    new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time)
  );
  
  // Agrupar por categoría
  const clases = sortedEvents.filter(event => event.category === 'clase');
  const eventos = sortedEvents.filter(event => event.category === 'evento');
  
  let html = '';
  
  // Renderizar Clases
  if (clases.length > 0) {
    html += `
      <div class="category-section">
        <h3 class="category-title clase-title">Clases</h3>
        <div class="events-grid">
          ${clases.map(event => createEventCard(event)).join('')}
        </div>
      </div>
    `;
  }
  
  // Renderizar Eventos
  if (eventos.length > 0) {
    html += `
      <div class="category-section">
        <h3 class="category-title evento-title">Eventos</h3>
        <div class="events-grid">
          ${eventos.map(event => createEventCard(event)).join('')}
        </div>
      </div>
    `;
  }
  
  eventsList.innerHTML = html;
}

// Crear tarjeta de evento
function createEventCard(event) {
  let detalles = `
    <span>${formatDate(event.date)}</span>
    <span>${event.time}</span>
    <span>${event.location}</span>
  `;
  
  // Agregar información específica según el tipo
  if (event.category === 'clase') {
    if (event.profesores) detalles += `<span>Profesores: ${event.profesores}</span>`;
    if (event.estilo) detalles += `<span>Estilo: ${event.estilo}</span>`;
    if (event.nivel) detalles += `<span>Nivel: ${event.nivel}</span>`;
  } else {
    if (event.banda) detalles += `<span>Banda: ${event.banda}</span>`;
    if (event.profesores) detalles += `<span>Profesores: ${event.profesores}</span>`;
    if (event.estilo) detalles += `<span>Estilo: ${event.estilo}</span>`;
    if (event.descripcion) detalles += `<span>Descripción: ${event.descripcion}</span>`;
  }
  
  return `
    <div class="event-card ${event.category}-card">
      <div class="event-header">
        <h4>${event.name}</h4>
        <button onclick="deleteEvent(${event.id})" class="delete-btn">×</button>
      </div>
      <div class="event-details">
        ${detalles}
      </div>
    </div>
  `;
}

// Eliminar evento
function deleteEvent(id) {
  if (confirm('¿Eliminar este evento?')) {
    events = events.filter(event => event.id !== id);
    saveEvents();
    renderEvents();
  }
}

// Formatear fecha
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES');
}

// Hacer función global para el event handler
window.deleteEvent = deleteEvent;

// Inicializar aplicación
init();
