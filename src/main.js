import './style.css'

// Estado simple de la aplicación
let events = JSON.parse(localStorage.getItem('swingEvents')) || [];

// Guardar eventos en localStorage
function saveEvents() {
  localStorage.setItem('swingEvents', JSON.stringify(events));
}

// Inicializar aplicación
function init() {
  const app = document.querySelector('#app');
  app.innerHTML = `
    <div class="container">
      <header>
        <h1>🎷 Festival de Swing - Ciudad Real</h1>
      </header>
      
      <main>
        <section class="form-section">
          <h2>Registrar Actividad</h2>
          <form id="event-form">
            <input type="text" id="event-name" placeholder="Nombre del evento" required>
            <input type="date" id="event-date" required>
            <input type="time" id="event-time" required>
            <input type="text" id="event-location" placeholder="Ubicación" required>
            <button type="submit">Agregar</button>
          </form>
        </section>
        
        <section class="program-section">
          <h2>Programa del Festival</h2>
          <div id="events-list"></div>
        </section>
      </main>
    </div>
  `;
  
  setupEventListeners();
  renderEvents();
}

// Configurar event listeners
function setupEventListeners() {
  const form = document.getElementById('event-form');
  form.addEventListener('submit', handleSubmit);
}

// Manejar envío del formulario
function handleSubmit(e) {
  e.preventDefault();
  
  const event = {
    id: Date.now(),
    name: document.getElementById('event-name').value,
    date: document.getElementById('event-date').value,
    time: document.getElementById('event-time').value,
    location: document.getElementById('event-location').value
  };
  
  events.push(event);
  saveEvents();
  
  // Limpiar formulario
  e.target.reset();
  
  // Actualizar lista
  renderEvents();
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
  
  eventsList.innerHTML = sortedEvents.map(event => `
    <div class="event-card">
      <div class="event-header">
        <h3>${event.name}</h3>
        <button onclick="deleteEvent(${event.id})" class="delete-btn">×</button>
      </div>
      <div class="event-details">
        <span>📅 ${formatDate(event.date)}</span>
        <span>🕐 ${event.time}</span>
        <span>📍 ${event.location}</span>
      </div>
    </div>
  `).join('');
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
