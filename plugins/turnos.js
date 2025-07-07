/**
 * Barbería Turnos Plugin Mejorado
 * ------------------------
 * Este plugin administra la lista de turnos para tu barbería, con mejoras en:
 * - Limpieza y robustez de comandos.
 * - Botones interactivos en todos los flujos.
 * - Control de errores más amigable.
 * - Opciones de admin para borrar listas funcionando correctamente.
 * - Mensajes claros si el usuario ya está apuntado.
 * - Opción para ver la lista completa y explicar el comando para solicitarla.
 *
 * Nota: ES Modules.
 */

import fs from 'fs';

// Configuración
const LISTA_PATH = './turnos.json';
const MAX_LIST = 40;
const NOMBRE_BARBERIA = '✂️ Barbería de Juan ✂️';

/**
 * Inicializa el archivo de listas si no existe.
 */
function initListas() {
  if (!fs.existsSync(LISTA_PATH)) {
    guardarListas({
      hoy: [],
      manana: [],
      fechahoy: fechaActual(),
      fechamanana: fechaManana()
    });
  }
}

/**
 * Carga las listas desde el archivo JSON.
 */
function cargarListas() {
  initListas();
  return JSON.parse(fs.readFileSync(LISTA_PATH));
}

/**
 * Guarda la estructura de listas en el archivo JSON.
 */
function guardarListas(data) {
  fs.writeFileSync(LISTA_PATH, JSON.stringify(data, null, 2));
}

/**
 * Devuelve la fecha actual en formato YYYY-MM-DD con desfase horario.
 */
function fechaActual() {
  const d = new Date();
  d.setHours(d.getHours() - 5);
  return d.toISOString().slice(0, 10);
}

/**
 * Devuelve la fecha de mañana en formato YYYY-MM-DD.
 */
function fechaManana() {
  const d = new Date();
  d.setHours(d.getHours() - 5);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Comprueba si el número ya está en la lista.
 */
function yaEnLista(lista, numero) {
  return lista.some(u => u.numero === numero);
}

/**
 * Formatea la lista de turnos para mostrarla.
 */
function formatearLista(lista, fecha) {
  let msg = `*${NOMBRE_BARBERIA}*\n`;
  msg += `*Lista de turnos del día: ${fecha}*\n\n`;

  if (lista.length === 0) {
    msg += '_Nadie apuntado aún_\n';
  } else {
    lista.forEach((turno, index) => {
      msg += `${index + 1}. ${turno.numero}    (${turno.fecha})\n`;
    });
  }

  const ocupados = lista.length;
  const libres = MAX_LIST - ocupados;
  msg += `\n🪑 Turnos ocupados: ${ocupados} / ${MAX_LIST}`;
  msg += `\n🕑 Turnos libres: ${libres}`;
  return msg;
}

/**
 * Devuelve el comando para pedir la lista completa.
 */
function comandoListaCompleta() {
  return 'Para ver la lista de 40 personas usa el comando: *.lista* o *.lista mañana*';
}

// Plugin principal
export default {
  /**
   * Handler principal de mensajes y comandos.
   */
  async before(m, { conn, command, args, isOwner }) {
    if (!m.text) return;
    let text = m.text.trim();
    let user = m.sender.replace(/[^0-9]/g, '');

    // Mostrar lista HOY + menú
    if (text === '.lista') {
      const listas = cargarListas();
      let msg = formatearLista(listas.hoy, listas.fechahoy);

      await conn.reply(m.chat, msg, m);

      return await conn.sendMessage(m.chat, {
        text: '¿Qué deseas hacer?',
        buttonText: 'Opciones',
        sections: [{
          title: 'Selecciona una opción:',
          rows: [
            { title: '✋ Apuntarme a la lista de HOY', rowId: `.addLis` },
            { title: '📅 Ver lista de MAÑANA', rowId: `.lista mañana` },
            { title: '👀 Ver lista completa', rowId: `.verLista hoy` }
          ]
        }]
      }, { quoted: m });
    }

    // Mostrar lista MAÑANA + menú
    if (text === '.lista mañana') {
      const listas = cargarListas();
      let msg = formatearLista(listas.manana, listas.fechamanana);

      await conn.reply(m.chat, msg, m);

      return await conn.sendMessage(m.chat, {
        text: '¿Qué deseas hacer?',
        buttonText: 'Opciones',
        sections: [{
          title: 'Selecciona una opción:',
          rows: [
            { title: '✋ Apuntarme a la lista de MAÑANA', rowId: `.addLis mañana` },
            { title: '📅 Ver lista de HOY', rowId: `.lista` },
            { title: '👀 Ver lista completa', rowId: `.verLista manana` }
          ]
        }]
      }, { quoted: m });
    }

    // Mostrar lista completa (HOY o MAÑANA)
    if (text.startsWith('.verLista')) {
      let cual = text.includes('manana') ? 'manana' : 'hoy';
      const listas = cargarListas();
      let msg = formatearLista(listas[cual], listas['fech' + cual]);
      msg += `\n\n${comandoListaCompleta()}`;
      return await conn.reply(m.chat, msg, m);
    }

    // Apuntarse a la lista (hoy o mañana)
    if (text === '.addLis' || text === '.addLis mañana') {
      const listas = cargarListas();
      let cual = text.includes('mañana') ? 'manana' : 'hoy';
      let lista = listas[cual];
      let fecha = listas['fech' + cual];
      let numero = user;

      if (yaEnLista(lista, numero)) {
        return await conn.sendMessage(m.chat, {
          text: 'Ya estás apuntado a la lista. Si quieres ver la lista completa, pulsa el botón.',
          buttonText: 'Opciones',
          sections: [{
            title: 'Acciones',
            rows: [
              { title: '👀 Ver lista completa', rowId: `.verLista ${cual}` }
            ]
          }]
        }, { quoted: m });
      }
      if (lista.length >= MAX_LIST) {
        if (cual === 'hoy') {
          return await conn.sendMessage(m.chat, {
            text: 'La lista de hoy está llena. ¿Quieres turno para mañana?',
            buttonText: 'Opciones',
            sections: [{
              title: 'Selecciona una opción:',
              rows: [
                { title: 'Sí, apúntame a mañana', rowId: '.addLis mañana' },
                { title: 'No, gracias', rowId: '.noadd' }
              ]
            }]
          }, { quoted: m });
        } else {
          return await conn.reply(m.chat, 'La lista de mañana está llena. Por favor, contacta al barbero.', m);
        }
      }
      return await conn.sendMessage(m.chat, {
        text: `¿Confirmas tu turno para el día ${fecha}?`,
        buttonText: 'Confirmar',
        sections: [{
          title: 'Confirmar turno',
          rows: [
            { title: 'Sí, quiero el turno', rowId: `.confirmLis ${cual}` },
            { title: 'No, cancelar', rowId: '.noadd' }
          ]
        }]
      }, { quoted: m });
    }

    // Confirmación de turno
    if (text.startsWith('.confirmLis ')) {
      const listas = cargarListas();
      let cual = text.includes('manana') ? 'manana' : 'hoy';
      let lista = listas[cual];
      let fecha = listas['fech' + cual];
      let numero = user;

      if (yaEnLista(lista, numero)) {
        return await conn.sendMessage(m.chat, {
          text: 'Ya estás apuntado en la lista.',
          buttonText: 'Opciones',
          sections: [{
            title: 'Acciones',
            rows: [
              { title: '👀 Ver lista completa', rowId: `.verLista ${cual}` }
            ]
          }]
        }, { quoted: m });
      }
      if (lista.length >= MAX_LIST) {
        return await conn.reply(m.chat, 'La lista ya está llena.', m);
      }
      lista.push({ numero, fecha });
      guardarListas(listas);
      return await conn.sendMessage(m.chat, {
        text: '¡Listo! Tienes tu turno reservado.',
        buttonText: 'Opciones',
        sections: [{
          title: 'Acciones',
          rows: [
            { title: '👀 Ver lista completa', rowId: `.verLista ${cual}` }
          ]
        }]
      }, { quoted: m });
    }

    // Cancelar proceso de registro
    if (text === '.noadd') {
      return await conn.reply(m.chat, 'No se ha reservado tu turno. Puedes intentarlo nuevamente cuando gustes.', m);
    }

    // ADMIN: Agregar turno manualmente
    if (isOwner && text.startsWith('.addManual ')) {
      let [pos, num, cual] = args;
      pos = parseInt(pos) - 1;
      if (!['hoy', 'manana'].includes(cual)) {
        return await conn.reply(m.chat, 'Debes especificar si es para hoy o mañana.', m);
      }
      const listas = cargarListas();
      let lista = listas[cual];
      if (yaEnLista(lista, num)) {
        return await conn.reply(m.chat, 'Ese número ya está en la lista.', m);
      }
      if (pos < 0 || pos >= MAX_LIST) {
        return await conn.reply(m.chat, 'Posición inválida.', m);
      }
      lista.splice(pos, 0, { numero: num, fecha: listas['fech' + cual] });
      if (lista.length > MAX_LIST) lista.length = MAX_LIST;
      guardarListas(listas);
      return await conn.reply(m.chat, `Agregado ${num} en la posición ${pos + 1} de la lista de ${cual}.`, m);
    }

    // ADMIN: Borrar lista HOY o MAÑANA (ahora sí borra la lista correctamente)
    if (isOwner && text.startsWith('.borrarLista')) {
      let cual = args[0];
      if (!['hoy', 'manana'].includes(cual)) {
        return await conn.reply(m.chat, 'Debes indicar si borrar la lista de hoy o de mañana.', m);
      }
      const listas = cargarListas();
      if (cual === 'hoy') {
        // Si se borra hoy: la lista de mañana pasa a ser la de hoy, y mañana se reinicia
        listas.hoy = listas.manana;
        listas.fechahoy = listas.fechamanana;
        listas.manana = [];
        listas.fechamanana = fechaManana();
      } else {
        // Solo reinicia la de mañana
        listas.manana = [];
        listas.fechamanana = fechaManana();
      }
      guardarListas(listas);
      return await conn.reply(m.chat, `La lista de ${cual} ha sido borrada correctamente.`, m);
    }
  },

  /**
   * Información de ayuda: Comandos disponibles y su descripción.
   */
  help: [
    '.lista               - Muestra la lista de turnos de HOY y opciones interactivas',
    '.lista mañana        - Muestra la lista de turnos de MAÑANA y opciones interactivas',
    '.addLis              - Opciones para apuntarte a la lista de HOY',
    '.addLis mañana       - Opciones para apuntarte a la lista de MAÑANA',
    '.verLista hoy        - Ver la lista completa de HOY',
    '.verLista manana     - Ver la lista completa de MAÑANA',
    '.addManual <pos> <número> <hoy|manana> - (Owner) Inserta un turno en una posición específica',
    '.borrarLista <hoy|manana>            - (Owner) Borra la lista de turnos de hoy o mañana',
    '.confirmLis <hoy|manana>             - Confirma tu turno en la lista correspondiente',
    '.noadd               - Cancela el registro del turno'
  ],

  tags: ['tools', 'barbería'],
  command: /^(lista|addLis|addManual|borrarLista|confirmLis|noadd|verLista)/i,
  owner: false
};