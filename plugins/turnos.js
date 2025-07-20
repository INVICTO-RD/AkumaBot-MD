
import fs from 'fs';
import fetch from 'node-fetch';

// Colores para la consola (códigos de escape ANSI)
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  fgBlack: "\x1b[30m",
  fgRed: "\x1b[31m",
  fgGreen: "\x1b[32m",
  fgYellow: "\x1b[33m",
  fgBlue: "\x1b[34m",
  fgMagenta: "\x1b[35m",
  fgCyan: "\x1b[36m",
  fgWhite: "\x1b[37m",
  fgGray: "\x1b[90m",
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
};

// --- CONFIGURACIÓN ---
const LISTA_PATH = './lib/listas.json'; // Ruta al archivo JSON de listas
const MAX_LIST = 40; // Número máximo de turnos en la lista
const NOMBRE_BARBERIA = '💈 BARBERIA JUAN 💈'; // Nombre de la barbería con IG
const BOT_OWNER_NUMBER = '3247079198912@s.whatsapp.net'; // Número del dueño del bot
// URL de la imagen del menú (opcional) - Se usa como thumbnail del mensaje.
// IMPORTANTE: Esta debe ser la URL DIRECTA de la imagen (ej. que termine en .jpg, .png).
const MENU_IMAGE = 'https://i.ibb.co/G4hL7fng/IMG-20250712-WA0033.jpg'; // URL DE IMAGEN DIRECTA DE IMBBB

// Objeto para mapear texto de botón o comandos de texto a comandos internos (TODAS LAS CLAVES EN MINÚSCULAS)
const buttonTextToCommand = {
    '✋ apuntarme a la lista de hoy': 'addlis hoy',
    '📅 ver lista de mañana': 'lista manana',
    '👀 ver lista completa': 'verlista',
    '❓ mostrar ayuda': 'ayuda',
    '🏠 volver al menú principal': 'lista',
    'no, gracias': 'noadd',
    'ver lista de turnos (hoy)': 'lista hoy',
    'ver lista de turnos (mañana)': 'lista manana',
    'apuntarme a la lista (hoy)': 'addlis hoy',
    'apuntarme a la lista (mañana)': 'addlis manana',
    'ver lista completa (hoy y mañana)': 'verlista',
    '👁️ ver comandos de owner (owner)': 'ayudaowner',
    'volver a comandos de owner': 'ayudaowner',
    '➕ borrar lista (owner)': 'borrarlista_instructions',
    '➕ borrar rango (owner)': 'borrarango_instructions',
    '➕ agregar manualmente (owner)': 'addmanual_instructions',
    '➖ quitar de la lista (owner)': 'quitarlista_instructions',
    '➕ instrucciones add manual': 'addmanual_instructions',
    '➕ instrucciones borrar lista': 'borrarlista_instructions',
    '➕ instrucciones borrar rango': 'borrarango_instructions',
    '➖ instrucciones quitar lista': 'quitarlista_instructions',
    // Comandos de texto directo que pueden ser multi-palabra
    'guárdame un turno': 'addlis hoy',
    'guardame un turno': 'addlis hoy', // Variación sin tilde
    'apuntame': 'addlis hoy', // Variación sin tilde
    'apúntame': 'addlis hoy',
    'quitar lista': 'quitarlista', // Para que funcione "quitar lista" como comando
    'sí, mover mi turno a la lista de hoy': 'move_to_hoy', // Nuevo para mover turno
    'sí, mover mi turno a la lista de mañana': 'move_to_manana', // Nuevo para mover turno
    'no, mantener mi turno actual': 'cancel_move', // Nuevo para cancelar movimiento
    // LÍNEA CORREGIDA PARA LA LISTA DE AYER
    '📅 ver lista de ayer (owner)': 'lista ayer',
    '➕ borrar lista de ayer (owner)': 'borrarlista ayer', // Agregado para el botón de borrar lista de ayer
};

// Simulación de fkontak (si no está definido en el entorno)
const fkontak = {
    key: {
        participant: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast',
    },
    message: {
        contactMessage: {
            displayName: 'BarberBot',
            vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:;BarberBot;;;\nFN:BarberBot\nEND:VCARD'
        }
    }
};

/**
 * Inicializa la estructura de las listas si el archivo no existe o está vacío.
 */
function initListas() {
  if (!fs.existsSync(LISTA_PATH) || fs.readFileSync(LISTA_PATH).toString().trim() === '') {
    fs.writeFileSync(LISTA_PATH, JSON.stringify({
      hoy: [],
      manana: [],
      ayer: [], // Nueva lista para el día anterior
      fechahoy: fechaActual(),
      fechamanana: fechaManana(),
      fechayer: '' // Fecha para la lista de ayer
    }, null, 2));
  }
}

/**
 * Carga las listas desde el archivo JSON.
 */
function cargarListas() {
  initListas(); // Asegura que el archivo exista antes de intentar leerlo
  try {
    const data = fs.readFileSync(LISTA_PATH, 'utf8');
    const listas = JSON.parse(data);
    // Asegurar que 'ayer' y 'fechayer' existan al cargar, para compatibilidad
    if (!listas.ayer) listas.ayer = [];
    if (!listas.fechayer) listas.fechayer = '';
    return listas;
  } catch (e) {
    console.error(colors.fgRed + colors.bright + `┃ ERROR: Falló al cargar listas desde ${LISTA_PATH}:`, e + colors.reset);
    // Si hay un error al cargar, inicializar con listas vacías para evitar un crash
    return {
      hoy: [],
      manana: [],
      ayer: [],
      fechahoy: fechaActual(),
      fechamanana: fechaManana(),
      fechayer: ''
    };
  }
}

/**
 * Guarda la estructura de listas en el archivo JSON.
 */
function guardarListas(data) {
  try {
    fs.writeFileSync(LISTA_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(colors.fgRed + colors.bright + `┃ ERROR: Falló al guardar listas en ${LISTA_PATH}:`, e + colors.reset);
  }
}

/**
 * Devuelve la fecha actual en formato YYYY-MM-DD con desfase horario para RD (AST -4).
 */
function fechaActual() {
  const d = new Date();
  d.setUTCHours(d.getUTCHours() - 4);
  return d.toISOString().slice(0, 10);
}

/**
 * Devuelve la fecha de mañana en formato YYYY-MM-DD con desfase horario para RD (AST -4).
 */
function fechaManana() {
  const d = new Date();
  d.setUTCHours(d.getUTCHours() - 4);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Devuelve la hora actual en formato HH:MM (ej. "14:35" o "09:05").
 * Con desfase horario para RD (AST -4).
 */
function horaActual() {
    const d = new Date();
    d.setUTCHours(d.getUTCHours() - 4); // Ajustar a la zona horaria AST (-4)
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Formatea una fecha de 'YYYY-MM-DD' a un formato completo y legible (ej. "Domingo 12 de Julio de 2025").
 * @param {string} dateString - La fecha en formato 'YYYY-MM-DD'.
 * @returns {string} La fecha formateada.
 */
function formatearFechaCompleta(dateString) {
  if (!dateString) return 'Fecha no disponible';
  const date = new Date(dateString + 'T00:00:00'); // Añadir 'T00:00:00' para evitar problemas de zona horaria
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('es-ES', options);
}

/**
 * Comprueba si el número ya está en la lista.
 */
function yaEnLista(lista, numero) {
  return lista.some(u => u && u.numero === numero);
}

/**
 * Elimina un usuario de una lista específica.
 * @param {Array} lista - La lista de la que se eliminará el usuario.
 * @param {string} numero - El número del usuario a eliminar.
 * @returns {Array} La nueva lista sin el usuario.
 */
function quitarUsuarioDeLista(lista, numero) {
    return lista.filter(u => u && u.numero !== numero);
}

/**
 * Formatea la lista de turnos para mostrarla, marcando el turno del usuario actual.
 * @param {Array} lista - La lista de turnos.
 * @param {string} fecha - La fecha de la lista (en formato YYYY-MM-DD).
 * @param {string} currentUserNumber - El número del usuario actual.
 * @param {boolean} isOwner - Indica si el usuario actual es el dueño del bot.
 * @param {string} listName - Nombre de la lista (ej. 'hoy', 'ayer', 'mañana') para el título.
 */
function formatearListaDetallada(lista, fecha, currentUserNumber, isOwner, listName) {
  let msg = `*${NOMBRE_BARBERIA}*\n`; // Nombre de la barbería grande

  if (listName === 'ayer') {
      msg += `*✅ ÚLTIMOS APUNTADOS ✅*\n\n`; // Título específico para lista de ayer
      for (let i = 0; i < lista.length; i++) { // Iterar solo sobre los elementos existentes
        const turno = lista[i];
        if (turno) {
          msg += `${i + 1}. ✅ `;
          if (isOwner) { // Si es el dueño, muestra el número
            msg += `(${turno.numero.split('@')[0]}) `; // Muestra el número sin el dominio
          }
          // Mostrar la hora si está disponible
          if (turno.hora) {
              msg += `[${turno.hora}] `;
          }
          msg += `\n`;
        }
      }
      if (lista.length === 0) {
        msg += `_No hay turnos registrados para este día._\n`;
      }
  } else {
      msg += `*Lista de turnos del día: ${formatearFechaCompleta(fecha)}* (${listName.toUpperCase()})\n\n`; // Fecha formateada completa y nombre de la lista

      let userFound = false;

      for (let i = 0; i < MAX_LIST; i++) {
        const turno = lista[i];
        if (turno) {
          if (isOwner) { // Si es el dueño, muestra el número
            if (turno.numero === currentUserNumber) {
              msg += `${i + 1}. ${turno.numero.split('@')[0]} [ 👤 TÚ ]`; // Muestra el número sin el dominio
              userFound = true;
            } else {
              msg += `${i + 1}. ${turno.numero.split('@')[0]} [ ✔️ ]`; // Muestra el número sin el dominio
            }
          } else { // Si no es el dueño, solo muestra el estado
            if (turno.numero === currentUserNumber) {
              msg += `${i + 1}. ✅ [ 👤 TÚ ]`;
              userFound = true;
            } else {
              msg += `${i + 1}. ✅`;
            }
          }
          // Mostrar la hora si está disponible
          if (turno.hora) {
              msg += ` (${turno.hora})`;
          }
          msg += `\n`;
        } else {
          msg += `${i + 1}. ❌\n`;
        }
      }

      const ocupados = lista.filter(Boolean).length;
      const libres = MAX_LIST - ocupados;
      msg += `\n🪑 Turnos ocupados: ${ocupados} / ${MAX_LIST}`;
      msg += `\n🕑 Turnos libres: ${libres}`;

      if (userFound) {
          msg += `\n\n_¡Ya estás en la lista!_`;
      } else if (ocupados < MAX_LIST && listName !== 'ayer') { // No se puede apuntar a la lista de ayer
          msg += `\n\n_Aún puedes apuntarte._`;
      } else if (ocupados >= MAX_LIST && listName !== 'ayer') {
          msg += `\n\n_La lista está llena._`;
      }
  }

  return msg;
}

/**
 * Formatea un mensaje conciso de resumen de la lista.
 */
function formatearResumenLista(listas, currentPrefix, currentUserNumber) {
    const ocupadosHoy = listas.hoy.filter(Boolean).length;
    const libresHoy = MAX_LIST - ocupadosHoy;
    const ocupadosManana = listas.manana.filter(Boolean).length;
    const libresManana = MAX_LIST - ocupadosManana;

    let msg = `*${NOMBRE_BARBERIA}*\n\n`; // Nombre de la barbería grande
    msg += `*Turnos de hoy (${formatearFechaCompleta(listas.fechahoy)})*\n`; // Fecha formateada para hoy
    msg += `🪑 *Hoy:* ${ocupadosHoy} / ${MAX_LIST} ocupados. (${libresHoy} libres)\n`;
    msg += `*Turnos de mañana (${formatearFechaCompleta(listas.fechamanana)})*\n`; // Fecha formateada para mañana
    msg += `📅 *Mañana:* ${ocupadosManana} / ${MAX_LIST} ocupados. (${libresManana} libres)\n\n`;
    return msg;
}


// Plugin principal
export default {
  async before(m, { conn, command, args, usedPrefix }) {
    if (!m.text) return;
    let text = m.text.trim();
    let user = m.sender.replace(/[^0-9]/g, '') + '@s.whatsapp.net'; // Asegurar formato completo del número

    // --- MENSAJES DE DEPURACIÓN ---
    console.log(colors.fgRed + colors.bright + '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    console.log(colors.fgRed + colors.bright + '┃ ⚠️ DEPURACIÓN DE COMANDOS - BARBERÍA ⚠️' + colors.reset);
    console.log(colors.fgRed + colors.bright + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);
    console.log(`${colors.fgRed}┃ ${colors.fgWhite}Mensaje Completo (m.text): ${colors.fgCyan}${m.text}${colors.reset}`);
    console.log(`${colors.fgRed}┃ ${colors.fgWhite}Remitente (m.sender): ${colors.fgCyan}${m.sender}${colors.reset}`);
    console.log(`${colors.fgRed}┃ ${colors.fgWhite}Número de Usuario (user): ${colors.fgCyan}${user}${colors.reset}`);
    console.log(`${colors.fgRed}┃ ${colors.fgWhite}Prefijo detectado (usedPrefix): ${colors.fgCyan}${usedPrefix}${colors.reset}`);
    console.log(`${colors.fgRed}┃ ${colors.fgWhite}Comando detectado por framework (command): ${colors.fgCyan}${command}${colors.reset}`);
    console.log(`${colors.fgRed}┃ ${colors.fgWhite}Texto ANTES de procesar botón (text): ${colors.fgCyan}${text}${colors.reset}`);
    console.log(`${colors.fgRed}┃ ${colors.fgWhite}¿Es respuesta de botón? (m.isButtonReply): ${colors.fgCyan}${m.isButtonReply}${colors.reset}`);
    console.log(`${colors.fgRed}┃ ${colors.fgWhite}m.message.buttonsResponseMessage?.selectedButtonId: ${colors.fgCyan}${m.message?.buttonsResponseMessage?.selectedButtonId}${colors.reset}`);

    let detectedCommand = null;
    let actualPrefix = '';
    const possiblePrefixes = ['.', '!', '#', '€', '/', '\\', '$', '%', '^', '&', '*', '+', '-', '=', '<', '>', '?', '~', '`', '_'];
    const lowerCaseText = text.toLowerCase(); // Convertir el texto de entrada a minúsculas una sola vez

    // Lógica de Detección de Comandos Mejorada:
    // Esta lógica prioriza la detección de comandos de botón (si el framework los maneja bien),
    // luego comandos multi-palabra y finalmente comandos de una sola palabra,
    // todo de forma insensible a mayúsculas/minúsculas y manejando prefijos.

    // 1. Intentar detectar si es una respuesta de botón por su ID (si el framework lo proporciona)
    if (m.isButtonReply && m.message && m.message.buttonsResponseMessage && m.message.buttonsResponseMessage.selectedButtonId) {
        let rawButtonId = m.message.buttonsResponseMessage.selectedButtonId.toLowerCase();
        for (const p of possiblePrefixes) {
            if (rawButtonId.startsWith(p)) {
                actualPrefix = p;
                detectedCommand = rawButtonId.substring(p.length).split(' ')[0]; // Tomar solo la primera palabra
                args = rawButtonId.substring(p.length).split(' ').slice(1); // El resto son args
                break;
            }
        }
        if (!actualPrefix) {
            actualPrefix = '.'; // Prefijo por defecto si no se encuentra en buttonId
            detectedCommand = rawButtonId.split(' ')[0]; // Si no hay prefijo, la primera palabra del ID es el comando
            args = rawButtonId.split(' ').slice(1);
        }
    } else {
        // 2. Si no es una respuesta de botón por ID, intentar mapear el texto del mensaje
        //    (que podría ser el texto de un botón presionado o un comando directo)
        let foundMappedCommand = false;
        // Ordenar las claves de buttonTextToCommand por longitud descendente para priorizar
        // comandos multi-palabra más largos (ej. "guárdame un turno" antes que "turno")
        const sortedButtonTextKeys = Object.keys(buttonTextToCommand).sort((a, b) => b.length - a.length);

        for (const key of sortedButtonTextKeys) {
            // Eliminar un posible prefijo del texto de entrada para la comparación
            let textWithoutPrefix = lowerCaseText;
            let tempPrefix = '';
            for (const p of possiblePrefixes) {
                if (lowerCaseText.startsWith(p)) {
                    tempPrefix = p;
                    textWithoutPrefix = lowerCaseText.substring(p.length);
                    break;
                }
            }

            // Comprobar si el texto (sin prefijo y en minúsculas) empieza o es igual a una clave de comando conocida
            // La condición `textWithoutPrefix === key` es para coincidencias exactas con el texto del botón.
            // La condición `textWithoutPrefix.startsWith(key + ' ')` es para comandos con argumentos.
            if (textWithoutPrefix === key || textWithoutPrefix.startsWith(key + ' ')) {
                const mappedValue = buttonTextToCommand[key]; // Obtener la cadena del comando interno (ej. 'addlis hoy')
                const parts = mappedValue.split(' ');
                detectedCommand = parts[0]; // El comando real (ej. 'addlis', 'lista')
                args = parts.slice(1);     // Cualquier argumento del comando mapeado

                actualPrefix = tempPrefix; // Usar el prefijo detectado
                foundMappedCommand = true;
                break; // Se encontró una coincidencia, detener la búsqueda
            }
        }

        if (!foundMappedCommand) {
            // 3. Si no se encontró ningún comando mapeado (multi-palabra o texto de botón),
            //    intentar detectar comandos de una sola palabra con prefijos o directos.
            for (const p of possiblePrefixes) {
                if (lowerCaseText.startsWith(p)) {
                    actualPrefix = p;
                    detectedCommand = lowerCaseText.substring(p.length).split(' ')[0];
                    args = lowerCaseText.substring(p.length).split(' ').slice(1);
                    break;
                }
            }
            if (!detectedCommand) {
                // Si no se detectó ningún comando con prefijo, asumir que es un comando directo de una sola palabra
                detectedCommand = lowerCaseText.split(' ')[0];
                args = lowerCaseText.split(' ').slice(1);
                actualPrefix = ''; // No se detectó prefijo
            }
        }
    }

    // Asegurarse de que actualPrefix esté siempre definido (por si acaso no se encontró ninguno y usedPrefix tampoco estaba)
    if (actualPrefix === '' && usedPrefix) {
        actualPrefix = usedPrefix;
    } else if (actualPrefix === '') {
        actualPrefix = '.'; // Prefijo por defecto si no se encontró ninguno
    }

    // Asegurarse de que detectedCommand esté siempre en minúsculas para comparaciones posteriores
    if (detectedCommand) {
        detectedCommand = detectedCommand.toLowerCase();
    }

    const commandArgs = args || []; // Array final de argumentos


    console.log(`${colors.fgRed}┃ ${colors.fgWhite}Prefijo DETECTADO (actualPrefix): ${colors.fgGreen}${actualPrefix === ''? '[NINGUNO]' : actualPrefix}${colors.reset}`);
    console.log(`${colors.fgRed}┃ ${colors.fgWhite}Comando DETECTADO (detectedCommand): ${colors.fgGreen}${detectedCommand}${colors.reset}`);
    console.log(`${colors.fgRed}┃ ${colors.fgWhite}Argumentos DETECTADOS (commandArgs): ${colors.fgGreen}${JSON.stringify(commandArgs)}${colors.reset}`);
    console.log(colors.fgRed + colors.bright + '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━' + colors.reset);

    const isBotOwner = user === BOT_OWNER_NUMBER;

    // --- Comandos de Usuario ---

    // Este bloque DEBE ir después de la detección de comandos de botón/mapeo
    // para evitar que los textos de los botones (ej. "📅 Ver lista de AYER (Owner)")
    // sean interpretados como el comando inicial `lista`.

    // Comando Inicial / Menú Principal (ej..lista, hoolwjf, guárdame un turno, apúntame)
    // Ahora 'guárdame un turno' y 'apúntame' también activan este menú directamente
    const isInitialCommand = (
        detectedCommand === 'lista' && commandArgs.length === 0 && !m.isButtonReply // Solo 'lista' sin args, y no es respuesta de botón
    ) || detectedCommand === 'hoolwjf' ||
       detectedCommand === 'guárdame un turno' ||
       detectedCommand === 'guardame un turno' ||
       detectedCommand === 'apúntame' ||
       detectedCommand === 'apuntame';


    if (isInitialCommand) {
        const listas = cargarListas();
        // Lógica de actualización de fecha y gestión de la lista 'ayer'
        if (listas.fechahoy !== fechaActual()) {
            console.log(colors.fgYellow + colors.bright + `┃ INFO: Detectado cambio de día. Actualizando listas.` + colors.reset);
            listas.ayer = listas.hoy; // La lista de hoy pasa a ser la de ayer
            listas.fechayer = listas.fechahoy; // La fecha de hoy pasa a ser la de ayer
            listas.hoy = listas.manana; // La lista de mañana pasa a ser la de hoy
            listas.fechahoy = fechaActual(); // La fecha de hoy se actualiza
            listas.manana = []; // La lista de mañana se vacía
            listas.fechamanana = fechaManana(); // La fecha de mañana se actualiza
            guardarListas(listas);
            console.log(colors.fgGreen + colors.bright + `┃ INFO: Listas actualizadas y lista de 'ayer' guardada.` + colors.reset);
        }

        let currentListMessage = formatearResumenLista(listas, actualPrefix, user);

        const mainButtons = [
            ['✋ Apuntarme a la lista de HOY', `${actualPrefix}addlis hoy`],
            ['📅 Ver lista de MAÑANA', `${actualPrefix}lista manana`],
            ['👀 Ver lista completa', `${actualPrefix}verlista`],
            ['❓ Mostrar Ayuda', `${actualPrefix}ayuda`]
        ];

        // Si el usuario es el dueño del bot, agregar el botón de comandos de Owner al menú principal
        if (isBotOwner) {
            mainButtons.push(['👁️ Ver comandos de Owner (Owner)', `${actualPrefix}ayudaowner`]);
            // El botón de 'ver lista de AYER' se mueve exclusivamente al menú de ayuda del owner
        }

        console.log(colors.fgGreen + colors.bright + '┃ INFO: El comando inicial fue detectado. Intentando enviar menú con botones.' + colors.reset);
        try {
            // Se pasa MENU_IMAGE directamente como el cuarto argumento (thumbnail)
            await conn.sendButton(m.chat, `${currentListMessage}\nSelecciona una opción para gestionar tus turnos:`, 'Menú Principal de Turnos', MENU_IMAGE, mainButtons, null, fkontak);
            console.log(colors.fgGreen + colors.bright + '┃ INFO: sendButton para el menú inicial completado con éxito.' + colors.reset);
        } catch (e) {
            console.error(colors.fgRed + colors.bright + '┃ ERROR: Falló sendButton para el menú inicial:', e + colors.reset);
             // Si falla el envío con imagen, intentar enviar sin imagen para que el bot no se detenga
            await conn.sendButton(m.chat, `${currentListMessage}\nSelecciona una opción para gestionar tus turnos:`, 'Menú Principal de Turnos', null, mainButtons, null, fkontak);
            console.log(colors.fgYellow + colors.bright + '┃ WARN: Intentando enviar menú sin imagen debido a un error anterior.' + colors.reset);
        }
        return;
    }


    // Mostrar lista de HOY
    if (detectedCommand === 'lista' && commandArgs[0] === 'hoy') {
        const listas = cargarListas();
        // Pasar isOwner a formatearListaDetallada
        let msg = formatearListaDetallada(listas.hoy, listas.fechahoy, user, isBotOwner, 'hoy');

        const listHoyButtons = [
            ['✋ Apuntarme a la lista de HOY', `${actualPrefix}addlis hoy`],
            ['📅 Ver lista de MAÑANA', `${actualPrefix}lista manana`],
            ['👀 Ver lista completa', `${actualPrefix}verlista`],
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ];

        console.log(colors.fgGreen + colors.bright + '┃ INFO: Comando "lista hoy" detectado. Intentando enviar lista detallada.' + colors.reset);
        try {
            await conn.sendButton(m.chat, msg, '¿Qué deseas hacer?', null, listHoyButtons, null, fkontak);
            console.log(colors.fgGreen + colors.bright + '┃ INFO: sendButton para "lista hoy" completado con éxito.' + colors.reset);
        } catch (e) {
            console.error(colors.fgRed + colors.bright + '┃ ERROR: Falló sendButton para "lista hoy":', e + colors.reset);
            await conn.reply(m.chat, 'Lo siento, hubo un error al mostrar la lista de hoy. Por favor, inténtalo de nuevo más tarde.', m);
        }
        return;
    }

    // Mostrar lista de MAÑANA
    if (detectedCommand === 'lista' && commandArgs[0] === 'manana') {
        const listas = cargarListas();
        // Pasar isOwner a formatearListaDetallada
        let msg = formatearListaDetallada(listas.manana, listas.fechamanana, user, isBotOwner, 'mañana');
        const listMananaButtons = [
            ['✋ Apuntarme a la lista de MAÑANA', `${actualPrefix}addlis manana`],
            ['📅 Ver lista de HOY', `${actualPrefix}lista hoy`],
            ['👀 Ver lista completa', `${actualPrefix}verlista`],
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ];

        console.log(colors.fgGreen + colors.bright + '┃ INFO: Comando "lista manana" detectado. Intentando enviar lista detallada.' + colors.reset);
        try {
            await conn.sendButton(m.chat, msg, '¿Qué deseas hacer?', null, listMananaButtons, null, fkontak);
            console.log(colors.fgGreen + colors.bright + '┃ INFO: sendButton para "lista manana" completado con éxito.' + colors.reset);
        } catch (e) {
            console.error(colors.fgRed + colors.bright + '┃ ERROR: Falló sendButton para "lista manana":', e + colors.reset);
            await conn.reply(m.chat, 'Lo siento, hubo un error al mostrar la lista de mañana. Por favor, inténtalo de nuevo más tarde.', m);
        }
        return;
    }

    // Mostrar lista de AYER (SOLO OWNER)
    if (isBotOwner && detectedCommand === 'lista' && commandArgs[0] === 'ayer') {
        const listas = cargarListas();
        if (!listas.ayer || listas.ayer.length === 0) {
            console.log(colors.fgYellow + colors.bright + '┃ WARN: Lista de AYER vacía o no existe.' + colors.reset);
            return await conn.sendButton(m.chat, 'La lista de ayer está vacía o no hay datos guardados para ayer.', 'Opciones:', null, [
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }
        // Pasar isOwner a formatearListaDetallada
        let msg = formatearListaDetallada(listas.ayer, listas.fechayer, user, isBotOwner, 'ayer');
        const listAyerButtons = [
            ['➕ Borrar lista de AYER (Owner)', `${actualPrefix}borrarlista ayer`], // Botón para borrar la lista de ayer
            ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ];

        console.log(colors.fgGreen + colors.bright + '┃ INFO: Comando "lista ayer" detectado. Enviando lista detallada.' + colors.reset);
        try {
            await conn.sendButton(m.chat, msg, '¿Qué deseas hacer?', null, listAyerButtons, null, fkontak);
            console.log(colors.fgGreen + colors.bright + '┃ INFO: sendButton para "lista ayer" completado con éxito.' + colors.reset);
        } catch (e) {
            console.error(colors.fgRed + colors.bright + '┃ ERROR: Falló sendButton para "lista ayer":', e + colors.reset);
            await conn.reply(m.chat, 'Lo siento, hubo un error al mostrar la lista de ayer. Por favor, inténtalo de nuevo más tarde.', m);
        }
        return;
    }


    // Apuntarse a la lista (hoy o mañana)
    if (detectedCommand === 'addlis') {
        let cual = commandArgs[0];
        if (!['hoy', 'manana'].includes(cual)) {
            console.log(colors.fgYellow + colors.bright + '┃ WARN: addlis: Día no especificado correctamente.' + colors.reset);
            return await conn.sendButton(m.chat, `Por favor, especifica si quieres un turno para *hoy* o *mañana*.`, 'Selecciona una opción:', null, [
                ['✋ Apuntarme a la lista de HOY', `${actualPrefix}addlis hoy`],
                ['✋ Apuntarme a la lista de MAÑANA', `${actualPrefix}addlis manana`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }

        const listas = cargarListas();
        let listaActual = listas[cual];
        let otraLista = (cual === 'hoy') ? listas.manana : listas.hoy;
        let nombreOtraLista = (cual === 'hoy') ? 'mañana' : 'hoy';
        let comandoMover = (cual === 'hoy') ? 'move_to_hoy' : 'move_to_manana';

        // 1. Comprobar si ya está en la misma lista
        if (yaEnLista(listaActual, user)) {
            console.log(colors.fgGreen + colors.bright + '┃ INFO: Usuario ya en la misma lista. Enviando mensaje de ya apuntado.' + colors.reset);
            return await conn.sendButton(m.chat, `Ya estás apuntado a la lista de ${cual}. Tu turno es el número *${listaActual.findIndex(u => u && u.numero === user) + 1}*. Puedes verla pulsando el botón.`, 'Opciones:', null, [
                ['👀 Ver lista completa', `${actualPrefix}verlista`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }

        // 2. Comprobar si ya está en la otra lista
        if (yaEnLista(otraLista, user)) {
            console.log(colors.fgYellow + colors.bright + `┃ WARN: Usuario ya en la lista de ${nombreOtraLista}. Ofreciendo mover.` + colors.reset);
            return await conn.sendButton(m.chat,
                `Ya estás apuntado a la lista de ${nombreOtraLista}. ¿Quieres mover tu turno a la lista de ${cual}?`,
                'Opciones:',
                null,
                [
                    [`Sí, mover mi turno a la lista de ${cual}`, `${actualPrefix}${comandoMover} ${user}`], // Pasar el número de usuario como argumento
                    ['No, mantener mi turno actual', `${actualPrefix}cancel_move`]
                ],
                null,
                fkontak
            );
        }

        // Si la lista está llena
        if (listaActual.length >= MAX_LIST) {
            if (cual === 'hoy') {
                console.log(colors.fgGreen + colors.bright + '┃ INFO: Lista de HOY llena. Ofreciendo MAÑANA.' + colors.reset);
                return await conn.sendButton(m.chat, 'La lista de HOY está llena. ¿Quieres turno para MAÑANA?', 'Selecciona una opción:', null, [
                    ['✋ Apuntarme a la lista de MAÑANA', `${actualPrefix}addlis manana`],
                    ['No, gracias', `${actualPrefix}noadd`]
                ], null, fkontak);
            } else {
                console.log(colors.fgGreen + colors.bright + '┃ INFO: Lista de MAÑANA llena.' + colors.reset);
                return await conn.sendButton(m.chat, 'La lista de MAÑANA también está llena. Por favor, contacta al barbero directamente.', 'Opciones:', null, [
                    ['👀 Ver lista completa', `${actualPrefix}verlista`],
                    ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
                ], null, fkontak);
            }
        }

        // Si todo está bien, añadir a la lista
        const newTurno = {
            numero: user,
            fecha: listas['fech' + cual],
            hora: horaActual() // ¡Añadimos la hora aquí!
        };
        listaActual.push(newTurno);
        listas[cual] = listaActual; // Asegurarse de que la lista actualizada se asigne de nuevo al objeto principal
        guardarListas(listas);
        console.log(colors.fgGreen + colors.bright + '┃ INFO: Turno reservado con éxito.' + colors.reset);
        // Usamos la fecha y hora del objeto newTurno para el mensaje de confirmación
        return await conn.sendButton(m.chat, `¡Listo! Tienes tu turno reservado para el día *${formatearFechaCompleta(newTurno.fecha)}* a las *${newTurno.hora}* en la posición *${listaActual.length}*.`, 'Opciones:', null, [
            ['👀 Ver lista completa', `${actualPrefix}verlista`],
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ], null, fkontak);
    }

    // Manejar el movimiento de turnos
    if (detectedCommand === 'move_to_hoy' || detectedCommand === 'move_to_manana') {
        const targetUser = commandArgs[0]; // El número de usuario que se va a mover
        if (!targetUser || targetUser !== user) { // Asegurarse de que el usuario que hace clic es el mismo que se va a mover
            console.log(colors.fgYellow + colors.bright + '┃ WARN: Intento de mover turno de otro usuario o sin usuario especificado.' + colors.reset);
            return await conn.reply(m.chat, 'Lo siento, no puedo procesar esa solicitud de movimiento de turno.', m);
        }

        const listas = cargarListas();
        let fromList, toList, fromListName, toListName;

        if (detectedCommand === 'move_to_hoy') {
            fromList = listas.manana;
            toList = listas.hoy;
            fromListName = 'manana';
            toListName = 'hoy';
        } else { // move_to_manana
            fromList = listas.hoy;
            toList = listas.manana;
            fromListName = 'hoy';
            toListName = 'manana';
        }

        // Quitar de la lista original
        const initialFromLength = fromList.length;
        // Encontrar el turno completo para poder moverlo con su hora original
        const turnToMove = fromList.find(u => u && u.numero === targetUser);
        listas[fromListName] = quitarUsuarioDeLista(fromList, targetUser);


        if (!turnToMove || listas[fromListName].length === initialFromLength) { // Si no se encontró el turno o no se quitó
            console.log(colors.fgYellow + colors.bright + `┃ WARN: Usuario ${targetUser} no encontrado en la lista de ${fromListName} para mover.` + colors.reset);
            return await conn.sendButton(m.chat, `No se pudo encontrar tu turno en la lista de ${fromListName}. Por favor, verifica tu estado.`, 'Opciones:', null, [
                ['👀 Ver lista completa', `${actualPrefix}verlista`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }

        // Añadir a la nueva lista (si hay espacio)
        if (toList.length >= MAX_LIST) {
            console.log(colors.fgYellow + colors.bright + `┃ WARN: La lista de ${toListName} está llena, no se pudo mover el turno.` + colors.reset);
            // Revertir el cambio si la nueva lista está llena
            listas[fromListName].push(turnToMove); // Volver a añadirlo a la lista original
            guardarListas(listas);
            return await conn.sendButton(m.chat, `La lista de ${toListName} está llena. No se pudo mover tu turno. Tu turno se mantiene en la lista de ${fromListName}.`, 'Opciones:', null, [
                ['👀 Ver lista completa', `${actualPrefix}verlista`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }

        // Actualizar la fecha del turno movido a la nueva lista
        turnToMove.fecha = listas['fech' + toListName];
        turnToMove.hora = horaActual(); // Actualizar la hora al momento del movimiento
        toList.push(turnToMove);
        listas[toListName] = toList; // Asegurarse de que la lista actualizada se asigne de nuevo
        guardarListas(listas);

        console.log(colors.fgGreen + colors.bright + `┃ INFO: Turno de ${targetUser} movido de ${fromListName} a ${toListName}.` + colors.reset);
        return await conn.sendButton(m.chat, `¡Tu turno ha sido movido con éxito a la lista de *${toListName}* (${formatearFechaCompleta(turnToMove.fecha)}) a las *${turnToMove.hora}* en la posición *${toList.length}*!`, 'Opciones:', null, [
            ['👀 Ver lista completa', `${actualPrefix}verlista`],
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ], null, fkontak);
    }

    // Cancelar movimiento de turno
    if (detectedCommand === 'cancel_move') {
        console.log(colors.fgGreen + colors.bright + '┃ INFO: Movimiento de turno cancelado.' + colors.reset);
        return await conn.sendButton(m.chat, 'Has decidido mantener tu turno actual. Puedes volver al menú principal.', 'Opciones:', null, [
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ], null, fkontak);
    }


    // Cancelar proceso de registro (si se usó un botón 'No, gracias')
    if (detectedCommand === 'noadd') {
        console.log(colors.fgGreen + colors.bright + '┃ INFO: Proceso de registro cancelado.' + colors.reset);
        return await conn.sendButton(m.chat, 'No se ha reservado tu turno. Puedes volver al menú principal para explorar otras opciones.', 'Opciones:', null, [
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ], null, fkontak);
    }

    // Mostrar lista completa (Hoy y Mañana)
    if (detectedCommand === 'verlista') {
        const listas = cargarListas();
        // Pasar isOwner a formatearListaDetallada para ambas listas
        let msgHoy = formatearListaDetallada(listas.hoy, listas.fechahoy, user, isBotOwner, 'hoy');
        let msgManana = formatearListaDetallada(listas.manana, listas.fechamanana, user, isBotOwner, 'mañana');

        console.log(colors.fgGreen + colors.bright + '┃ INFO: Comando "verlista" detectado. Enviando lista completa detallada.' + colors.reset);
        await conn.sendButton(m.chat, `${msgHoy}\n\n${msgManana}`, 'Opciones:', null, [
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ], null, fkontak);
        return;
    }

    // Mostrar ayuda con comandos disponibles (para usuarios normales)
    if (detectedCommand === 'ayuda') {
        const ayudaButtons = [
            ['Ver lista de turnos (Hoy)', `${actualPrefix}lista hoy`],
            ['Ver lista de turnos (Mañana)', `${actualPrefix}lista manana`],
            ['Apuntarme a la lista (Hoy)', `${actualPrefix}addlis hoy`],
            ['Apuntarme a la lista (Mañana)', `${actualPrefix}addlis manana`],
            ['Ver lista completa (Hoy y Mañana)', `${actualPrefix}verlista`]
        ];

        ayudaButtons.push(['🏠 Volver al Menú Principal', `${actualPrefix}lista`]);

        console.log(colors.fgGreen + colors.bright + '┃ INFO: Comando "ayuda" detectado. Enviando opciones de ayuda.' + colors.reset);
        await conn.sendButton(m.chat, 'Aquí tienes las opciones disponibles para usuarios:', 'Selecciona una opción:', null, ayudaButtons, null, fkontak);
        return;
    }

    // Mostrar ayuda para Owner
    if (isBotOwner && detectedCommand === 'ayudaowner') {
        const ownerButtons = [
            ['➕ Borrar lista (Owner)', `${actualPrefix}borrarlista_instructions`],
            ['➕ Borrar Rango (Owner)', `${actualPrefix}borrarango_instructions`], // Nuevo botón de instrucciones
            ['➕ Agregar manualmente (Owner)', `${actualPrefix}addmanual_instructions`],
            ['➖ Quitar de la lista (Owner)', `${actualPrefix}quitarlista_instructions`],
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ];

        // Lógica corregida para añadir el botón de "Ver lista de AYER"
        const listas = cargarListas(); // Cargar listas aquí para tener los datos más recientes de 'ayer'
        if (listas.ayer && listas.ayer.length > 0) {
            // Inserta antes del último elemento (Volver al Menú Principal)
            ownerButtons.splice(ownerButtons.length - 1, 0, ['📅 Ver lista de AYER (Owner)', `${actualPrefix}lista ayer`]);
        }


        console.log(colors.fgGreen + colors.bright + '┃ INFO: Comando "ayudaowner" detectado. Enviando opciones de owner.' + colors.reset);
        await conn.sendButton(m.chat, 'Aquí tienes los comandos de administrador:', 'Selecciona una opción:', null, ownerButtons, null, fkontak);
        return;
    }

    // ADMIN: Proporcionar instrucciones para addManual (al hacer clic en el botón)
    if (isBotOwner && detectedCommand === 'addmanual_instructions') {
        console.log(colors.fgGreen + colors.bright + '┃ INFO: Comando "addmanual_instructions" detectado. Enviando instrucciones.' + colors.reset);
        return await conn.sendButton(m.chat, `Para agregar un turno manualmente, usa el formato:\n\n*${actualPrefix}addmanual <posición> <número> <hoy|manana>*\n\nEjemplo:\n*${actualPrefix}addmanual 5 18091234567 hoy* (para agregar el número 18091234567 en la posición 5 de la lista de hoy)`, 'Puedes volver al menú principal o a la ayuda de owner.', null, [
            ['➕ Instrucciones Add Manual', `${actualPrefix}addmanual_instructions`],
            ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ], null, fkontak);
    }

    // ADMIN: Proporcionar instrucciones para borrarLista (al hacer clic en el botón)
    if (isBotOwner && detectedCommand === 'borrarlista_instructions') {
        console.log(colors.fgGreen + colors.bright + '┃ INFO: Comando "borrarlista_instructions" detectado. Enviando instrucciones.' + colors.reset);
        return await conn.sendButton(m.chat, `Para borrar una lista, usa el formato:\n\n*${actualPrefix}borrarlista <hoy|manana|ayer>*\n\nEjemplo:\n*${actualPrefix}borrarlista hoy* (para borrar la lista de hoy)`, 'Puedes volver al menú principal o a la ayuda de owner.', null, [
            ['➕ Instrucciones Borrar Lista', `${actualPrefix}borrarlista_instructions`],
            ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ], null, fkontak);
    }

    // ADMIN: Proporcionar instrucciones para borrarango (al hacer clic en el botón)
    if (isBotOwner && detectedCommand === 'borrarango_instructions') {
        console.log(colors.fgGreen + colors.bright + '┃ INFO: Comando "borrarango_instructions" detectado. Enviando instrucciones.' + colors.reset);
        return await conn.sendButton(m.chat, `Para borrar un rango de turnos, usa el formato:\n\n*${actualPrefix}borrarango <inicio>-<fin> <hoy|manana>*\n\nEjemplo:\n*${actualPrefix}borrarango 1-5 hoy* (para borrar los turnos del 1 al 5 de la lista de hoy)`, 'Puedes volver al menú principal o a la ayuda de owner.', null, [
            ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ], null, fkontak);
    }

    // ADMIN: Proporcionar instrucciones para quitarLista (al hacer clic en el botón)
    if (isBotOwner && detectedCommand === 'quitarlista_instructions') {
        console.log(colors.fgGreen + colors.bright + '┃ INFO: Comando "quitarlista_instructions" detectado. Enviando instrucciones.' + colors.reset);
        return await conn.sendButton(m.chat, `Para quitar un turno de la lista, usa el formato:\n\n*${actualPrefix}quitarlista <número_de_telefono> <hoy|manana>*\n\nEjemplo:\n*${actualPrefix}quitarlista 18091234567 hoy* (para quitar el número 18091234567 de la lista de hoy)`, 'Puedes volver al menú principal o a la ayuda de owner.', null, [
            ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ], null, fkontak);
    }


    // ADMIN: Agregar turno manualmente
    if (isBotOwner && detectedCommand === 'addmanual') {
        let pos = parseInt(commandArgs[0]) - 1;
        let num = commandArgs[1];
        let cual = commandArgs[2];

        if (commandArgs.length < 3) {
            console.log(colors.fgYellow + colors.bright + '┃ WARN: Formato addManual incorrecto.' + colors.reset);
            return await conn.sendButton(m.chat, `*ERROR DE COMANDO*\n\nFormato incorrecto. Uso: *${actualPrefix}addmanual <posición> <número> <hoy|manana>*\n\nEjemplo:\n*${actualPrefix}addmanual 5 18091234567 hoy* (para agregar el número 18091234567 en la posición 5 de la lista de hoy)`, 'Opciones:', null, [
                ['➕ Instrucciones Add Manual', `${actualPrefix}addmanual_instructions`],
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }

        if (isNaN(pos) || pos < 0 || pos >= MAX_LIST) {
            console.log(colors.fgYellow + colors.bright + '┃ WARN: addManual: Posición inválida.' + colors.reset);
            return await conn.sendButton(m.chat, `*ERROR DE COMANDO*\n\nPosición inválida. Debe ser un número entre 1 y ${MAX_LIST}.`, 'Opciones:', null, [
                ['➕ Instrucciones Add Manual', `${actualPrefix}addmanual_instructions`],
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }
        if (!['hoy', 'manana'].includes(cual)) {
            console.log(colors.fgYellow + colors.bright + '┃ WARN: addManual: Día no especificado correctamente.' + colors.reset);
            return await conn.sendButton(m.chat, `*ERROR DE COMANDO*\n\nDebes especificar si es para hoy o mañana (hoy/manana).`, 'Opciones:', null, [
                ['➕ Instrucciones Add Manual', `${actualPrefix}addmanual_instructions`],
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }

        const listas = cargarListas();
        let lista = listas[cual];

        if (num && !num.includes('@s.whatsapp.net')) {
            num = num + '@s.whatsapp.net';
        }

        if (yaEnLista(lista, num)) {
            console.log(colors.fgYellow + colors.bright + '┃ WARN: addManual: Número ya en lista.' + colors.reset);
            return await conn.sendButton(m.chat, 'Ese número ya está en la lista.', 'Opciones:', null, [
                ['👀 Ver lista completa', `${actualPrefix}verlista`],
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }

        // Asegurarse de que el array tenga la longitud necesaria para el splice
        while (lista.length <= pos) { // Usar <= para incluir la posición si es el final
            lista.push(undefined);
        }
        lista.splice(pos, 0, { numero: num, fecha: listas['fech' + cual], hora: horaActual() }); // Añadir hora aquí también

        // Eliminar 'undefined' y truncar si excede MAX_LIST
        lista = lista.filter(n => n !== undefined);
        if (lista.length > MAX_LIST) {
            lista.length = MAX_LIST;
        }

        listas[cual] = lista; // Asegurarse de que la lista actualizada se asigne de nuevo al objeto principal
        guardarListas(listas);
        console.log(colors.fgGreen + colors.bright + `┃ INFO: Agregado ${num} en posición ${pos + 1} de lista de ${cual}.` + colors.reset);
        return await conn.sendButton(m.chat, `Agregado ${num.split('@')[0]} en la posición ${pos + 1} de la lista de ${cual} (${formatearFechaCompleta(listas['fech' + cual])}) a las ${horaActual()}.`, 'Opciones:', null, [
            ['👀 Ver lista completa', `${actualPrefix}verlista`],
            ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`]
        ], null, fkontak);
    }

    // ADMIN: Borrar lista HOY o MAÑANA o AYER
    if (isBotOwner && detectedCommand === 'borrarlista') {
        let cual = commandArgs[0];
        if (!['hoy', 'manana', 'ayer'].includes(cual)) {
            console.log(colors.fgYellow + colors.bright + '┃ WARN: borrarlista: Día no especificado correctamente.' + colors.reset);
            return await conn.sendButton(m.chat, `*ERROR DE COMANDO*\n\nDebes indicar si borrar la lista de hoy, mañana o ayer.`, 'Opciones:', null, [
                ['➕ Instrucciones Borrar Lista', `${actualPrefix}borrarlista_instructions`],
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }
        const listas = cargarListas();
        if (cual === 'hoy') {
            listas.hoy = [];
            listas.fechahoy = fechaActual(); // Reiniciar fecha para hoy
        } else if (cual === 'manana') {
            listas.manana = [];
            listas.fechamanana = fechaManana(); // Reiniciar fecha para mañana
        } else { // cual === 'ayer'
            listas.ayer = [];
            listas.fechayer = ''; // Limpiar la fecha de ayer
        }
        guardarListas(listas);
        console.log(colors.fgGreen + colors.bright + `┃ INFO: Lista de ${cual} borrada.` + colors.reset);
        return await conn.sendButton(m.chat, `La lista de ${cual} ha sido borrada correctamente.`, 'Opciones:', null, [
            ['👀 Ver lista completa', `${actualPrefix}verlista`],
            ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`]
        ], null, fkontak);
    }

    // ADMIN: Quitar de la lista (nuevo comando)
    if (isBotOwner && detectedCommand === 'quitarlista') {
        let numToRemove = commandArgs[0];
        let cual = commandArgs[1];

        if (commandArgs.length < 2) {
            console.log(colors.fgYellow + colors.bright + '┃ WARN: quitarlista: Formato incorrecto.' + colors.reset);
            return await conn.sendButton(m.chat, `*ERROR DE COMANDO*\n\nFormato incorrecto. Uso: *${actualPrefix}quitarlista <número> <hoy|manana>*\n\nEjemplo:\n*${actualPrefix}quitarlista 18091234567 hoy*`, 'Opciones:', null, [
                ['➖ Instrucciones Quitar Lista', `${actualPrefix}quitarlista_instructions`],
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }

        if (!['hoy', 'manana'].includes(cual)) { // 'ayer' no se permite quitar individualmente por ahora para simplificar.
            console.log(colors.fgYellow + colors.bright + '┃ WARN: quitarlista: Día no especificado correctamente.' + colors.reset);
            return await conn.sendButton(m.chat, `*ERROR DE COMANDO*\n\nDebes especificar si es para hoy o mañana (hoy/manana).`, 'Opciones:', null, [
                ['➖ Instrucciones Quitar Lista', `${actualPrefix}quitarlista_instructions`],
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }

        const listas = cargarListas();
        let lista = listas[cual];

        // Asegurarse de que el número esté en formato completo
        if (numToRemove && !numToRemove.includes('@s.whatsapp.net')) {
            numToRemove = numToRemove + '@s.whatsapp.net';
        }

        const initialLength = lista.length;
        // Filtrar el número, esto automáticamente "sube" los elementos restantes
        const filteredList = lista.filter(u => u && u.numero !== numToRemove);
        listas[cual] = filteredList; // Actualizar la lista en el objeto principal

        if (listas[cual].length < initialLength) { // Comprobar la longitud de la lista actualizada
            if (listas[cual].length > MAX_LIST) {
                listas[cual].length = MAX_LIST; // Esto es una salvaguarda, no debería pasar al quitar.
            }
            guardarListas(listas);
            console.log(colors.fgGreen + colors.bright + `┃ INFO: ${numToRemove} quitado de la lista de ${cual}.` + colors.reset);
            return await conn.sendButton(m.chat, `El número *${numToRemove.split('@')[0]}* ha sido quitado de la lista de ${cual}.`, 'Opciones:', null, [
                ['👀 Ver lista completa', `${actualPrefix}verlista`],
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`]
            ], null, fkontak);
        } else {
            console.log(colors.fgYellow + colors.bright + `┃ WARN: quitarlista: ${numToRemove} no encontrado en la lista de ${cual}.` + colors.reset);
            return await conn.sendButton(m.chat, `El número *${numToRemove.split('@')[0]}* no fue encontrado en la lista de ${cual}.`, 'Opciones:', null, [
                ['👀 Ver lista completa', `${actualPrefix}verlista`],
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`]
            ], null, fkontak);
        }
    }

    // ADMIN: Borrar rango de turnos
    if (isBotOwner && detectedCommand === 'borrarango') {
        const rangeStr = commandArgs[0]; // Ej: "1-30"
        const cual = commandArgs[1];    // Ej: "hoy"

        if (!rangeStr || !rangeStr.includes('-') || !cual) {
            console.log(colors.fgYellow + colors.bright + '┃ WARN: borrarango: Formato incorrecto.' + colors.reset);
            return await conn.sendButton(m.chat, `*ERROR DE COMANDO*\n\nFormato incorrecto. Uso: *${actualPrefix}borrarango <inicio>-<fin> <hoy|manana>*\n\nEjemplo:\n*${actualPrefix}borrarango 1-5 hoy* (para borrar los turnos del 1 al 5 de la lista de hoy)`, 'Opciones:', null, [
                ['➕ Instrucciones Borrar Rango', `${actualPrefix}borrarango_instructions`],
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }

        const [startStr, endStr] = rangeStr.split('-');
        const start = parseInt(startStr);
        const end = parseInt(endStr);

        if (isNaN(start) || isNaN(end) || start < 1 || end > MAX_LIST || start > end) {
            console.log(colors.fgYellow + colors.bright + '┃ WARN: borrarango: Rango inválido.' + colors.reset);
            return await conn.sendButton(m.chat, `*ERROR DE COMANDO*\n\nRango de posiciones inválido. Debe ser números válidos y el inicio no puede ser mayor que el fin (ej. 1-10).`, 'Opciones:', null, [
                ['➕ Instrucciones Borrar Rango', `${actualPrefix}borrarango_instructions`],
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }

        if (!['hoy', 'manana'].includes(cual)) { // 'ayer' no se permite borrar por rango, solo la lista completa.
            console.log(colors.fgYellow + colors.bright + '┃ WARN: borrarango: Día no especificado correctamente.' + colors.reset);
            return await conn.sendButton(m.chat, `*ERROR DE COMANDO*\n\nDebes especificar si es para hoy o mañana (hoy/manana).`, 'Opciones:', null, [
                ['➕ Instrucciones Borrar Rango', `${actualPrefix}borrarango_instructions`],
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }

        const listas = cargarListas();
        let listaToModify = listas[cual];

        if (listaToModify.length === 0) {
            console.log(colors.fgYellow + colors.bright + `┃ WARN: borrarango: La lista de ${cual} está vacía.` + colors.reset);
            return await conn.sendButton(m.chat, `La lista de ${cual} está vacía, no hay turnos para borrar.`, 'Opciones:', null, [
                ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
                ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
            ], null, fkontak);
        }

        // Almacenar el rango y el tipo de lista para la confirmación
        const confirmCommandId = `${actualPrefix}confirm_borrarango ${start}-${end} ${cual}`;

        console.log(colors.fgGreen + colors.bright + `┃ INFO: Confirmación de borrado de rango ${start}-${end} de ${cual}.` + colors.reset);
        return await conn.sendButton(m.chat, `¿Estás seguro de que quieres eliminar los turnos del *${start}* al *${end}* de la lista de *${cual}*?`, 'Esta acción es irreversible.', null, [
            [`Sí, eliminar ${start}-${end} de ${cual}`, confirmCommandId],
            ['No, cancelar', `${actualPrefix}cancel_delete`]
        ], null, fkontak);
    }

    // ADMIN: Confirmación de borrado de rango
    if (isBotOwner && detectedCommand === 'confirm_borrarango') {
        const rangeStr = commandArgs[0];
        const cual = commandArgs[1];

        const [startStr, endStr] = rangeStr.split('-');
        const start = parseInt(startStr);
        const end = parseInt(endStr);

        const listas = cargarListas();
        let listaToModify = listas[cual];

        const originalLength = listaToModify.length;
        let removedCount = 0;

        // Crear una nueva lista excluyendo el rango especificado
        const newList = [];
        for (let i = 0; i < listaToModify.length; i++) {
            if ((i + 1) < start || (i + 1) > end) { // Si la posición no está en el rango a borrar
                newList.push(listaToModify[i]);
            } else if (listaToModify[i]) { // Contar solo los turnos que realmente existían en el rango
                removedCount++;
            }
        }

        listas[cual] = newList;
        guardarListas(listas);

        console.log(colors.fgGreen + colors.bright + `┃ INFO: Rango ${start}-${end} de ${cual} eliminado. Total eliminados: ${removedCount}.` + colors.reset);
        return await conn.sendButton(m.chat, `Se han eliminado *${removedCount}* turnos del *${start}* al *${end}* de la lista de *${cual}*. La lista ha sido reordenada.`, 'Opciones:', null, [
            ['👀 Ver lista completa', `${actualPrefix}verlista`],
            ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`]
        ], null, fkontak);
    }

    // ADMIN: Cancelar acción de borrado
    if (isBotOwner && detectedCommand === 'cancel_delete') {
        console.log(colors.fgGreen + colors.bright + '┃ INFO: Acción de borrado cancelada.' + colors.reset);
        return await conn.sendButton(m.chat, 'Acción de borrado cancelada.', 'Opciones:', null, [
            ['Volver a comandos de Owner', `${actualPrefix}ayudaowner`],
            ['🏠 Volver al Menú Principal', `${actualPrefix}lista`]
        ], null, fkontak);
    }
  },

  help: [
    'lista               - Muestra el menú principal de turnos (o usa guárdame un turno / apúntame)'
  ],
  tags: ['tools', 'barbería'],
  // Regex para todos los comandos, incluyendo los de múltiples palabras, insensibles a mayúsculas/minúsculas
  command: /^(lista|hoolwjf|guárdame un turno|guardame un turno|apúntame|apuntame|addlis|noadd|verlista|ayuda|borrarlista|addmanual|ayudaowner|addmanual_instructions|borrarlista_instructions|quitarlista|quitar lista|quitarlista_instructions|move_to_hoy|move_to_manana|cancel_move|borrarango|confirm_borrarango|cancel_delete)/i,
  owner: false
};

