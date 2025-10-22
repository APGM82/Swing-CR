import './style.css'

// Estado simple de la aplicación
let eventos = JSON.parse(localStorage.getItem('swingEvents')) || [];

// Guardar eventos en localStorage
function guardarEventos() {
  localStorage.setItem('swingEvents', JSON.stringify(eventos));
}

// Inicializar aplicación
function inicializar() {
  configurarEventListeners();
  mostrarEventos();
}

// Configurar event listeners
function configurarEventListeners() {
  const formulario = document.getElementById('formulario-evento');
  const selectCategoria = document.getElementById('categoria-evento');
  const inputFecha = document.getElementById('fecha-evento');
  const inputHora = document.getElementById('hora-evento');
  
  formulario.addEventListener('submit', manejarEnvio);
  selectCategoria.addEventListener('change', actualizarUbicaciones);
  inputFecha.addEventListener('change', actualizarUbicaciones);
  inputHora.addEventListener('change', actualizarUbicaciones);
}

// Actualizar opciones de ubicación según categoría, fecha y hora
function actualizarUbicaciones() {
  const categoria = document.getElementById('categoria-evento').value;
  const fecha = document.getElementById('fecha-evento').value;
  const hora = document.getElementById('hora-evento').value;
  const selectUbicacion = document.getElementById('ubicacion-evento');
  const divMensaje = document.getElementById('mensaje-disponibilidad');
  
  // Mostrar/ocultar campos específicos
  const camposClase = document.getElementById('campos-clase');
  const camposEvento = document.getElementById('campos-evento');
  
  camposClase.style.display = 'none';
  camposEvento.style.display = 'none';
  divMensaje.innerHTML = '';
  
  // Verificar que tenemos todos los datos necesarios
  if (!categoria || !fecha || !hora) {
    selectUbicacion.disabled = true;
    selectUbicacion.innerHTML = '<option value="">Selecciona fecha, hora y tipo primero</option>';
    return;
  }
  
  // Mostrar campos específicos según el tipo
  if (categoria === 'clase') {
    camposClase.style.display = 'block';
  } else if (categoria === 'evento') {
    camposEvento.style.display = 'block';
  }
  
  // Obtener ubicaciones disponibles
  const ubicacionesDisponibles = obtenerUbicacionesDisponibles(categoria, fecha, hora);
  
  selectUbicacion.disabled = false;
  selectUbicacion.innerHTML = '<option value="">Selecciona ubicación</option>';
  
  // Agregar opciones disponibles
  ubicacionesDisponibles.disponibles.forEach(ubicacion => {
    const opcion = document.createElement('option');
    opcion.value = ubicacion;
    opcion.textContent = ubicacion;
    selectUbicacion.appendChild(opcion);
  });
  
  // Mostrar mensaje de disponibilidad
  mostrarMensajeDisponibilidad(ubicacionesDisponibles, divMensaje);
}

// Función simple para obtener ubicaciones disponibles
function obtenerUbicacionesDisponibles(categoria, fecha, hora) {
  let todasLasUbicaciones = [];
  
  if (categoria === 'clase') {
    todasLasUbicaciones = ['Be Hopper', 'New Orleans', 'Savoy'];
  } else {
    todasLasUbicaciones = [
      'Antiguo Casino de Ciudad Real',
      'Parque de Gasset', 
      'Prado',
      'Be Hopper',
      'New Orleans',
      'Savoy'
    ];
  }
  
  const disponibles = [];
  const ocupadas = [];
  
  // Obtener solo la hora (sin minutos) para intervalos de 1 hora
  const horaActual = obtenerSoloHora(hora);
  
  // Verificar cada ubicación
  todasLasUbicaciones.forEach(ubicacion => {
    const conflicto = eventos.find(evento => {
      const horaEvento = obtenerSoloHora(evento.time);
      return evento.location === ubicacion &&
             evento.date === fecha &&
             horaEvento === horaActual;
    });
    
    if (conflicto) {
      ocupadas.push({
        ubicacion: ubicacion,
        nombreEvento: conflicto.name
      });
    } else {
      disponibles.push(ubicacion);
    }
  });
  
  return { disponibles, ocupadas };
}

// Función simple para obtener solo la hora (sin minutos)
function obtenerSoloHora(hora) {
  return hora.split(':')[0];
}

// Función simple para mostrar mensaje de disponibilidad
function mostrarMensajeDisponibilidad(datosDisponibilidad, divMensaje) {
  let mensaje = '';
  
  if (datosDisponibilidad.disponibles.length > 0) {
    mensaje += 'Ubicaciones disponibles: ' + datosDisponibilidad.disponibles.length;
    divMensaje.className = 'available';
  } else {
    mensaje += 'No hay ubicaciones disponibles en este horario';
    divMensaje.className = 'occupied';
  }
  
  if (datosDisponibilidad.ocupadas.length > 0) {
    mensaje += '<br><br>Ocupadas: ';
    datosDisponibilidad.ocupadas.forEach(item => {
      mensaje += item.ubicacion + ' (' + item.nombreEvento + ') ';
    });
  }
  
  divMensaje.innerHTML = mensaje;
}

// Manejar envío del formulario
function manejarEnvio(e) {
  e.preventDefault();
  
  const categoria = document.getElementById('categoria-evento').value;
  
  const nuevoEvento = {
    id: Date.now(),
    name: document.getElementById('nombre-evento').value,
    category: categoria,
    date: document.getElementById('fecha-evento').value,
    time: document.getElementById('hora-evento').value,
    location: document.getElementById('ubicacion-evento').value
  };
  
  // Agregar campos específicos según el tipo
  if (categoria === 'clase') {
    nuevoEvento.profesores = document.getElementById('profesores').value;
    nuevoEvento.estilo = document.getElementById('estilo').value;
    nuevoEvento.nivel = document.getElementById('nivel').value;
  } else if (categoria === 'evento') {
    nuevoEvento.banda = document.getElementById('banda').value;
    nuevoEvento.profesores = document.getElementById('profesores-evento').value;
    nuevoEvento.estilo = document.getElementById('estilo-evento').value;
    nuevoEvento.descripcion = document.getElementById('descripcion').value;
  }
  
  // Validar ubicación según tipo de evento
  const errorUbicacion = validarUbicacionEvento(nuevoEvento);
  if (errorUbicacion) {
    alert(errorUbicacion);
    return;
  }
  
  // Validar conflicto de ubicación y horario
  const conflicto = verificarConflictoUbicacion(nuevoEvento);
  if (conflicto) {
    alert(`Conflicto de ubicación: Ya existe "${conflicto.name}" en ${conflicto.location} el ${formatearFecha(conflicto.date)} a las ${conflicto.time}`);
    return;
  }
  
  eventos.push(nuevoEvento);
  guardarEventos();
  
  // Limpiar formulario
  e.target.reset();
  actualizarUbicaciones(); // Resetear campos condicionales
  
  // Actualizar lista
  mostrarEventos();
}

// Validar ubicación según tipo de evento
function validarUbicacionEvento(nuevoEvento) {
  const salasClase = ['Be Hopper', 'New Orleans', 'Savoy'];
  const ubicacionesEvento = ['Antiguo Casino de Ciudad Real', 'Parque de Gasset', 'Prado'];
  
  // Validar horarios del festival
  const errorHorario = validarHorarioEvento(nuevoEvento);
  if (errorHorario) {
    return errorHorario;
  }
  
  // Si es una clase, debe estar en las salas específicas
  if (nuevoEvento.category === 'clase' && !salasClase.includes(nuevoEvento.location)) {
    return `Las clases solo pueden realizarse en: ${salasClase.join(', ')}`;
  }
  
  // Si es evento en sala de clases, verificar que no haya clases en ese horario
  if (nuevoEvento.category === 'evento' && salasClase.includes(nuevoEvento.location)) {
    const claseEnSala = eventos.find(evento => {
      const horaNuevoEvento = obtenerSoloHora(nuevoEvento.time);
      const horaEventoExistente = obtenerSoloHora(evento.time);
      
      return evento.category === 'clase' &&
             evento.location === nuevoEvento.location &&
             evento.date === nuevoEvento.date &&
             horaEventoExistente === horaNuevoEvento;
    });
    
    if (claseEnSala) {
      return `No se puede usar ${nuevoEvento.location}: hay una clase programada ("${claseEnSala.name}") en ese horario`;
    }
  }
  
  return null; // Sin errores
}

// Validar horarios del festival
function validarHorarioEvento(nuevoEvento) {
  const fechaEvento = nuevoEvento.date;
  const horaEvento = nuevoEvento.time;
  
  // Viernes: desde las 20:00 hasta las 24:00
  if (fechaEvento === '2026-10-23') {
    if (horaEvento < '20:00' || horaEvento > '24:00') {
      return `El viernes las actividades son de 20:00 a 24:00`;
    }
  }
  
  // Sábado: de 20:00 a 24:00
  if (fechaEvento === '2026-10-24') {
    if (horaEvento < '20:00' || horaEvento > '24:00') {
      return `El sábado las actividades son de 20:00 a 24:00`;
    }
  }
  
  // Domingo: de 20:00 a 24:00
  if (fechaEvento === '2026-10-25') {
    if (horaEvento < '20:00' || horaEvento > '24:00') {
      return `El domingo las actividades son de 20:00 a 24:00`;
    }
  }
  
  return null; // Sin errores
}

// Verificar conflictos de ubicación y horario (por intervalos de 1 hora)
function verificarConflictoUbicacion(nuevoEvento) {
  const horaNuevoEvento = obtenerSoloHora(nuevoEvento.time);
  
  return eventos.find(eventoExistente => {
    const horaEventoExistente = obtenerSoloHora(eventoExistente.time);
    
    return eventoExistente.location === nuevoEvento.location &&
           eventoExistente.date === nuevoEvento.date &&
           horaEventoExistente === horaNuevoEvento;
  });
}

// Mostrar lista de eventos
function mostrarEventos() {
  const listaEventos = document.getElementById('lista-eventos');
  
  if (eventos.length === 0) {
    listaEventos.innerHTML = '<p class="vacia">No hay eventos registrados</p>';
    return;
  }
  
  // Ordenar eventos por fecha y hora
  const eventosOrdenados = eventos.sort((a, b) => 
    new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time)
  );
  
  // Agrupar por categoría
  const clases = eventosOrdenados.filter(evento => evento.category === 'clase');
  const eventosLista = eventosOrdenados.filter(evento => evento.category === 'evento');
  
  let html = '';
  
  // Renderizar Clases
  if (clases.length > 0) {
    html += `
      <div class="seccion-categoria">
        <h3 class="titulo-categoria titulo-clase">Clases</h3>
        <div class="parrilla-eventos">
          ${clases.map(evento => crearTarjetaEvento(evento)).join('')}
        </div>
      </div>
    `;
  }
  
  // Renderizar Eventos
  if (eventosLista.length > 0) {
    html += `
      <div class="seccion-categoria">
        <h3 class="titulo-categoria titulo-evento">Eventos</h3>
        <div class="parrilla-eventos">
          ${eventosLista.map(evento => crearTarjetaEvento(evento)).join('')}
        </div>
      </div>
    `;
  }
  
  listaEventos.innerHTML = html;
}

// Crear tarjeta de evento
function crearTarjetaEvento(evento) {
  let detalles = `
    <span>${formatearFecha(evento.date)}</span>
    <span>${evento.time}</span>
    <span>${evento.location}</span>
  `;
  
  // Agregar información específica según el tipo
  if (evento.category === 'clase') {
    if (evento.profesores) detalles += `<span>Profesores: ${evento.profesores}</span>`;
    if (evento.estilo) detalles += `<span>Estilo: ${evento.estilo}</span>`;
    if (evento.nivel) detalles += `<span>Nivel: ${evento.nivel}</span>`;
  } else {
    if (evento.banda) detalles += `<span>Banda: ${evento.banda}</span>`;
    if (evento.profesores) detalles += `<span>Profesores: ${evento.profesores}</span>`;
    if (evento.estilo) detalles += `<span>Estilo: ${evento.estilo}</span>`;
    if (evento.descripcion) detalles += `<span>Descripción: ${evento.descripcion}</span>`;
  }
  
  return `
    <div class="tarjeta-evento ${evento.category}-tarjeta">
      <div class="encabezado-evento">
        <h4>${evento.name}</h4>
        <button onclick="eliminarEvento(${evento.id})" class="btn-eliminar">×</button>
      </div>
      <div class="detalles-evento">
        ${detalles}
      </div>
    </div>
  `;
}

// Eliminar evento
function eliminarEvento(id) {
  if (confirm('¿Eliminar este evento?')) {
    eventos = eventos.filter(evento => evento.id !== id);
    guardarEventos();
    mostrarEventos();
  }
}

// Formatear fecha
function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-ES');
}

// Hacer función global para el event handler
window.eliminarEvento = eliminarEvento;

// Inicializar aplicación
inicializar();
