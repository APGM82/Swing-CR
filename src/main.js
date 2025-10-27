import './style.css'

// Array para guardar todos los eventos
let eventos = JSON.parse(localStorage.getItem('swingEvents')) || [];

// Guardar en el navegador
function guardarEventos() {
  localStorage.setItem('swingEvents', JSON.stringify(eventos));
}

// Cuando carga la página
function inicializar() {
  configurarEventListeners();
  configurarDragDrop();
  configurarVentanaDetalles();
  mostrarEventos();
  mostrarCalendario();
}

// Configurar los eventos del formulario
function configurarEventListeners() {
  const formulario = document.getElementById('formulario-evento');
  const selectCategoria = document.getElementById('categoria-evento');
  const inputFecha = document.getElementById('fecha-evento');
  const inputHora = document.getElementById('hora-evento');
  
  // Cuando se envía el formulario
  formulario.addEventListener('submit', manejarEnvio);
  // Cuando cambian la categoría, fecha u hora, actualizar ubicaciones disponibles
  selectCategoria.addEventListener('change', actualizarUbicaciones);
  inputFecha.addEventListener('change', actualizarUbicaciones);
  inputHora.addEventListener('change', actualizarUbicaciones);
}

// Actualizar las ubicaciones según lo que seleccionen
function actualizarUbicaciones() {
  const categoria = document.getElementById('categoria-evento').value;
  const fecha = document.getElementById('fecha-evento').value;
  const hora = document.getElementById('hora-evento').value;
  const selectUbicacion = document.getElementById('ubicacion-evento');
  const divMensaje = document.getElementById('mensaje-disponibilidad');
  
  const camposClase = document.getElementById('campos-clase');
  const camposEvento = document.getElementById('campos-evento');
  
  // Esconder los campos extras al principio
  camposClase.style.display = 'none';
  camposEvento.style.display = 'none';
  divMensaje.innerHTML = '';
  
  // Si falta algo, no dejar seleccionar ubicación
  if (!categoria || !fecha || !hora) {
    selectUbicacion.disabled = true;
    selectUbicacion.innerHTML = '<option value="">Selecciona fecha, hora y tipo primero</option>';
    return;
  }
  
  // Mostrar campos según si es clase o evento
  if (categoria === 'clase') {
    camposClase.style.display = 'block';
  } else if (categoria === 'evento') {
    camposEvento.style.display = 'block';
  }
  
  const ubicacionesDisponibles = obtenerUbicacionesDisponibles(categoria, fecha, hora);
  
  selectUbicacion.disabled = false;
  selectUbicacion.innerHTML = '<option value="">Selecciona ubicación</option>';
  
  ubicacionesDisponibles.disponibles.forEach(ubicacion => {
    const opcion = document.createElement('option');
    opcion.value = ubicacion;
    opcion.textContent = ubicacion;
    selectUbicacion.appendChild(opcion);
  });
  
  mostrarMensajeDisponibilidad(ubicacionesDisponibles, divMensaje);
}

// Ver qué ubicaciones están libres
function obtenerUbicacionesDisponibles(categoria, fecha, hora) {
  let todasLasUbicaciones = [];
  
  // Las clases solo pueden ser en estas salas
  if (categoria === 'clase') {
    todasLasUbicaciones = ['Be Hopper', 'New Orleans', 'Savoy'];
  } else {
    // Los eventos pueden ser en cualquier lado
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
  const horaActual = obtenerSoloHora(hora);
  
  // Revisar cada ubicación para ver si está ocupada
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

// Sacar solo la hora sin minutos (para comparar por bloques de 1 hora)
function obtenerSoloHora(hora) {
  return hora.split(':')[0];
}

// Mostrar mensaje simple cuando se agrega algo
function mostrarMensaje(texto, esError = false) {
  const contenedor = document.getElementById('contenedor-notificaciones');
  
  // Crear div para el mensaje
  const mensaje = document.createElement('div');
  mensaje.className = esError ? 'mensaje-confirmacion error' : 'mensaje-confirmacion';
  mensaje.textContent = texto;
  mensaje.style.display = 'block';
  
  // Ponerlo en la página
  contenedor.appendChild(mensaje);
  
  // Quitarlo después de 3 segundos
  setTimeout(() => {
    mensaje.style.display = 'none';
    contenedor.removeChild(mensaje);
  }, 3000);
}

// Mostrar cuántas ubicaciones hay libres
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
    mensaje += '<br><br>Ocupadas: <br>';
    datosDisponibilidad.ocupadas.forEach(item => {
      mensaje += item.ubicacion + ' (' + item.nombreEvento + ') <br>';
    });
  }
  
  divMensaje.innerHTML = mensaje;
}

// Cuando envían el formulario
function manejarEnvio(e) {
  e.preventDefault();
  
  const categoria = document.getElementById('categoria-evento').value;
  
  // Crear el objeto con los datos del formulario
  const nuevoEvento = {
    id: Date.now(),
    name: document.getElementById('nombre-evento').value,
    category: categoria,
    date: document.getElementById('fecha-evento').value,
    time: document.getElementById('hora-evento').value,
    location: document.getElementById('ubicacion-evento').value
  };
  
  // Agregar campos extra según el tipo
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
  
  // Validar que todo esté bien
  const errorUbicacion = validarUbicacionEvento(nuevoEvento);
  if (errorUbicacion) {
    mostrarMensaje(errorUbicacion, true);
    return;
  }
  
  // Ver si hay conflicto con otro evento
  const conflicto = verificarConflictoUbicacion(nuevoEvento);
  if (conflicto) {
    mostrarMensaje(`Ya hay otro evento en esa ubicación y hora`, true);
    return;
  }
  
  // Si todo está bien, guardar
  eventos.push(nuevoEvento);
  guardarEventos();
  
  // Mostrar que se agregó bien
  const tipoTexto = categoria === 'clase' ? 'Clase' : 'Evento';
  mostrarMensaje(`${tipoTexto} agregado correctamente`);
  
  // Limpiar el formulario y actualizar todo
  e.target.reset();
  actualizarUbicaciones();
  mostrarEventos(nuevoEvento.id);
  mostrarCalendario();
}

// Validar que el evento esté en el lugar correcto
function validarUbicacionEvento(nuevoEvento) {
  const salasClase = ['Be Hopper', 'New Orleans', 'Savoy'];
  
  // Primero revisar el horario
  const errorHorario = validarHorarioEvento(nuevoEvento);
  if (errorHorario) {
    return errorHorario;
  }
  
  // Las clases solo pueden ser en ciertas salas
  if (nuevoEvento.category === 'clase' && !salasClase.includes(nuevoEvento.location)) {
    return `Las clases solo pueden realizarse en: ${salasClase.join(', ')}`;
  }
  
  // Los eventos grandes no pueden usar salas de clase si hay clase
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
  
  return null;
}

// Verificar que el evento esté en el horario permitido
function validarHorarioEvento(nuevoEvento) {
  const fechaEvento = nuevoEvento.date;
  const horaEvento = nuevoEvento.time;
  
  // Viernes 24 de octubre
  if (fechaEvento === '2025-10-24') {
    if (horaEvento < '20:00' || horaEvento > '24:00') {
      return `El viernes las actividades son de 20:00 a 24:00`;
    }
  }
  
  // Sábado 25 de octubre
  if (fechaEvento === '2025-10-25') {
    if (horaEvento < '16:00' || horaEvento > '24:00') {
      return `El sábado las actividades son de 16:00 a 24:00`;
    }
  }
  
  // Domingo 26 de octubre
  if (fechaEvento === '2025-10-26') {
    if (horaEvento < '16:00' || horaEvento > '20:00') {
      return `El domingo las actividades son de 16:00 a 20:00`;
    }
  }
  
  return null;
}

// Revisar si hay otro evento al mismo tiempo y lugar
function verificarConflictoUbicacion(nuevoEvento) {
  const horaNuevoEvento = obtenerSoloHora(nuevoEvento.time);
  
  return eventos.find(eventoExistente => {
    const horaEventoExistente = obtenerSoloHora(eventoExistente.time);
    
    // Mismo lugar, fecha y hora = conflicto
    return eventoExistente.location === nuevoEvento.location &&
           eventoExistente.date === nuevoEvento.date &&
           horaEventoExistente === horaNuevoEvento;
  });
}

// Mostrar todos los eventos en la lista
function mostrarEventos(eventoNuevoId = null) {
  const listaEventos = document.getElementById('lista-eventos');
  
  if (eventos.length === 0) {
    listaEventos.innerHTML = '<p class="vacia">No hay eventos registrados</p>';
    return;
  }
  
  // Ordenar por fecha y hora
  const eventosOrdenados = eventos.sort((a, b) => 
    new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time)
  );
  
  // Separar clases y eventos
  const clases = eventosOrdenados.filter(evento => evento.category === 'clase');
  const eventosLista = eventosOrdenados.filter(evento => evento.category === 'evento');
  
  let html = '';
  
  // Mostrar las clases primero
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
  
  // Después los eventos
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
  
  // Si hay un evento nuevo, ponerlo verde para que se vea
  if (eventoNuevoId) {
    setTimeout(() => {
      const tarjetaNueva = document.querySelector(`[data-evento-id="${eventoNuevoId}"]`);
      if (tarjetaNueva) {
        tarjetaNueva.classList.add('nueva');
        // Quitar el verde después de unos segundos
        setTimeout(() => {
          tarjetaNueva.classList.remove('nueva');
        }, 3000);
      }
    }, 100);
  }
}

// Crear tarjeta de evento
// Crear la tarjeta HTML de cada evento
function crearTarjetaEvento(evento) {
  // Información básica que todos tienen
  let detalles = `
    <span>${formatearFecha(evento.date)}</span>
    <span>${evento.time}</span>
    <span>${evento.location}</span>
  `;
  
  // Agregar info extra según el tipo
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
  
  // Devolver el HTML de la tarjeta
  return `
    <div class="tarjeta-evento ${evento.category}-tarjeta" draggable="true" data-evento-id="${evento.id}">
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

// Borrar un evento
function eliminarEvento(id) {
  if (confirm('¿Eliminar este evento?')) {
    eventos = eventos.filter(evento => evento.id !== id);
    guardarEventos();
    mostrarEventos();
    mostrarCalendario();
    
    // Avisar que se borró
    mostrarMensaje('Evento eliminado');
  }
}

// Poner la fecha en formato bonito
function formatearFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-ES');
}

// Poner los eventos en el calendario
function mostrarCalendario() {
  const celdas = document.querySelectorAll('.celda-calendario');
  
  // Limpiar todo primero
  celdas.forEach(celda => {
    celda.innerHTML = '';
    celda.classList.remove('muchos-eventos');
  });
  
  // Poner cada evento en su celda
  eventos.forEach(evento => {
    const celda = document.querySelector(
      `.celda-calendario[data-fecha="${evento.date}"][data-hora="${evento.time}"]`
    );
    
    if (celda) {
      // Crear el div del evento
      const eventoDiv = document.createElement('div');
      eventoDiv.className = `evento-calendario ${evento.category}-tarjeta`;
      eventoDiv.draggable = true;
      eventoDiv.dataset.eventoId = evento.id;
      eventoDiv.innerHTML = `
        <strong>${evento.name}</strong><br>
        <small>${evento.location}</small>
      `;
      
      // Para poder arrastrarlo
      eventoDiv.addEventListener('dragstart', manejarDragStart);
      
      // Para ver los detalles cuando hacen clic
      eventoDiv.addEventListener('click', () => mostrarDetallesEvento(evento.id));
      
      celda.appendChild(eventoDiv);
    }
  });
  
  // Marcar las celdas que tienen muchos eventos
  celdas.forEach(celda => {
    const numEventos = celda.querySelectorAll('.evento-calendario').length;
    if (numEventos > 2) {
      celda.classList.add('muchos-eventos');
    }
  });
}

// Activar el drag & drop en el calendario
function configurarDragDrop() {
  const celdas = document.querySelectorAll('.celda-calendario');
  
  celdas.forEach(celda => {
    celda.addEventListener('dragover', manejarDragOver);
    celda.addEventListener('drop', manejarDrop);
    celda.addEventListener('dragleave', manejarDragLeave);
  });
}

// Cuando empiezan a arrastrar
function manejarDragStart(e) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', e.target.dataset.eventoId);
}

// Cuando arrastran sobre una celda
function manejarDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over'); // Marcar visualmente
}

// Cuando salen de la celda
function manejarDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}

// Cuando sueltan el evento en una celda
function manejarDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  
  const eventoId = parseInt(e.dataTransfer.getData('text/html'));
  const celda = e.currentTarget;
  const nuevaFecha = celda.dataset.fecha;
  const nuevaHora = celda.dataset.hora;
  
  // Buscar el evento que están moviendo
  const evento = eventos.find(ev => ev.id === eventoId);
  if (evento) {
    // Guardar por si hay que devolverlo
    const fechaAntigua = evento.date;
    const horaAntigua = evento.time;
    
    // Cambiar temporalmente
    evento.date = nuevaFecha;
    evento.time = nuevaHora;
    
    // Ver si hay conflicto
    const conflicto = eventos.find(ev => {
      if (ev.id === eventoId) return false; // No comparar consigo mismo
      
      const horaEvento = obtenerSoloHora(ev.time);
      const horaNueva = obtenerSoloHora(nuevaHora);
      
      return ev.location === evento.location &&
             ev.date === nuevaFecha &&
             horaEvento === horaNueva;
    });
    
    if (conflicto) {
      // Si hay conflicto, devolver todo como estaba
      evento.date = fechaAntigua;
      evento.time = horaAntigua;
      
      mostrarMensaje('No se puede mover ahí, ya hay otro evento', true);
      mostrarCalendario();
    } else {
      // Si está bien, guardar
      guardarEventos();
      mostrarCalendario();
      mostrarEventos();
      
      // Avisar que se movió
      mostrarMensaje('Evento movido correctamente');
    }
  }
}

// Mostrar ventana con detalles del evento
function mostrarDetallesEvento(eventoId) {
  // Buscar el evento
  const evento = eventos.find(ev => ev.id === eventoId);
  if (!evento) return;
  
  // Poner el título
  const titulo = document.getElementById('ventana-titulo');
  titulo.textContent = evento.name;
  
  // Crear la información del evento
  let info = `
    <p><strong>Categoría:</strong> ${evento.category === 'clase' ? 'Clase' : 'Evento'}</p>
    <p><strong>Fecha:</strong> ${formatearFecha(evento.date)}</p>
    <p><strong>Hora:</strong> ${evento.time}</p>
    <p><strong>Ubicación:</strong> ${evento.location}</p>
  `;
  
  // Agregar info específica según el tipo
  if (evento.category === 'clase') {
    if (evento.profesores) info += `<p><strong>Profesores:</strong> ${evento.profesores}</p>`;
    if (evento.estilo) info += `<p><strong>Estilo:</strong> ${evento.estilo}</p>`;
    if (evento.nivel) info += `<p><strong>Nivel:</strong> ${evento.nivel}</p>`;
  } else {
    if (evento.banda) info += `<p><strong>Banda:</strong> ${evento.banda}</p>`;
    if (evento.profesores) info += `<p><strong>Profesores:</strong> ${evento.profesores}</p>`;
    if (evento.estilo) info += `<p><strong>Estilo:</strong> ${evento.estilo}</p>`;
    if (evento.descripcion) info += `<p><strong>Descripción:</strong> ${evento.descripcion}</p>`;
  }
  
  // Poner la info en la ventana
  document.getElementById('ventana-info').innerHTML = info;
  
  // Mostrar la ventana
  document.getElementById('ventana-detalles').style.display = 'block';
}

// Cerrar la ventana
function cerrarVentana() {
  document.getElementById('ventana-detalles').style.display = 'none';
}

// Configurar los botones de la ventana
function configurarVentanaDetalles() {
  // Botón de cerrar (la X)
  const botonCerrar = document.querySelector('.cerrar-ventana');
  botonCerrar.addEventListener('click', cerrarVentana);
  
  // Si hacen clic fuera de la ventana, también cerrarla
  const ventana = document.getElementById('ventana-detalles');
  window.addEventListener('click', (e) => {
    if (e.target === ventana) {
      cerrarVentana();
    }
  });
}

window.eliminarEvento = eliminarEvento;

inicializar();
