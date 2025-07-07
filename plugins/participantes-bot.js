import PhoneNumber from 'awesome-phonenumber';
import { promises as fs } from 'fs';
import { join } from 'path';
import moment from 'moment-timezone';

// Constantes
const MAX_PARTICIPANTS = 40;
const botOwner = '18098781279'; // Reemplaza esto con tu número de teléfono

// Inicializa la base de datos de participantes si no existe
const initializeParticipantsDB = () => {
    if (!global.db || !global.db.data) {
        global.db = { data: {} };
    }
    if (!global.db.data.participants) {
        global.db.data.participants = {};
    }
};

// Obtiene la lista de participantes para el día actual
const getParticipantsList = (currentDate) => {
    return global.db.data.participants[currentDate] || [];
};

// Obtiene la lista completa de participantes
const getAllParticipantsList = () => {
    let allParticipants = [];
    for (let date in global.db.data.participants) {
        allParticipants = allParticipants.concat(global.db.data.participants[date]);
    }
    return allParticipants;
};

// Formatea la lista de participantes para mostrarla
const formatParticipantsList = (participants) => {
    let message = '';
    for (let i = 0; i < MAX_PARTICIPANTS; i++) {
        if (participants[i]) {
            message += `${i + 1}. ${participants[i].number} - ${participants[i].name}\n   ${participants[i].date} ${participants[i].time}\n`;
        } else {
            message += `${i + 1}. [vacio ❌]\n`;
        }
    }
    return message;
};

// Formatea la lista completa de participantes para mostrarla
const formatAllParticipantsList = (participants) => {
    let message = 'Lista completa de participantes:\n\n';
    participants.forEach((participant, index) => {
        message += `${index + 1}. ${participant.number} - ${participant.name} (Agregado el ${participant.date} a las ${participant.time})\n`;
    });
    return message;
};

// Maneja el comando para agregar participantes
const handleAddParticipant = async (m, conn) => {
    const currentDate = new Date().toLocaleDateString();
    const currentTime = new Date().toLocaleTimeString();
    const userNumber = m.sender.split('@')[0];

    if (!m.text.includes(' ')) {
        return conn.reply(m.chat, `❌ Por favor, proporciona tu nombre después del comando.`, m);
    }

    const userName = m.text.split(' ').slice(1).join(' ');

    initializeParticipantsDB();

    let participants = getParticipantsList(currentDate);

    if (participants.length >= MAX_PARTICIPANTS) {
        return conn.reply(m.chat, `🚫 La lista está llena. Puedes apuntarte para la lista de mañana.`, m);
    }

    if (participants.some(participant => participant.number === userNumber)) {
        return conn.reply(m.chat, `❌ Ya estás en la lista.`, m);
    }

    participants.push({
        id: m.sender,
        number: userNumber,
        name: userName,
        date: currentDate,
        time: currentTime
    });

    global.db.data.participants[currentDate] = participants;

    await conn.reply(m.chat, `✅ Has sido agregado a la lista como ${userName}.\n\nLista de participantes:\n\n${formatParticipantsList(participants)}`, m);
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

// Maneja el comando para mostrar la lista de participantes
const handleShowList = async (m, conn) => {
    const currentDate = new Date().toLocaleDateString();
    let participants = getParticipantsList(currentDate);

    await conn.reply(m.chat, `Aquí está el menú de lista:\n\n${formatParticipantsList(participants)}`, m);
};

// Maneja el comando para mostrar la lista completa de participantes
const handleShowAllList = async (m, conn) => {
    let participants = getAllParticipantsList();

    await conn.reply(m.chat, formatAllParticipantsList(participants), m);
};

// Maneja el comando para mostrar los comandos del menú
const handleShowMenuCommands = async (m, conn) => {
    const menuCommands = `
Comandos del menú de lista de turnos:
1. *Ver Lista*: ${usedPrefix}moslist
2. *Ver Lista Completa*: ${usedPrefix}moslistall
3. *Salir Lista*: ${usedPrefix}salirlista
4. *Borrar Lista*: ${usedPrefix}borrarlista (Solo el dueño del bot)
5. *Pago Banco BHD*: ${usedPrefix}pagobhd
6. *Pago Banco Popular*: ${usedPrefix}pagopopular
`.trim();

    await conn.reply(m.chat, menuCommands, m);
};

// Maneja el comando para borrar la lista de participantes
const handleClearList = async (m, conn) => {
    // Verificar si el comando fue ejecutado por el dueño del bot
    if (m.sender.split('@')[0] !== botOwner) {
        return conn.reply(m.chat, `❌ No tienes permiso para ejecutar este comando. Solo el dueño del bot puede hacerlo.`, m);
    }

    global.db.data.participants = {};

    await conn.reply(m.chat, `✅ La lista ha sido borrada y reinicializada.`, m);
};

// Maneja el comando para salir de la lista de participantes
const handleRemoveParticipant = async (m, conn) => {
    const currentDate = new Date().toLocaleDateString();
    const userNumber = m.sender.split('@')[0];

    initializeParticipantsDB();

    let participants = getParticipantsList(currentDate);

    const index = participants.findIndex(participant => participant.number === userNumber);

    if (index === -1) {
        return conn.reply(m.chat, `❌ No estás en la lista.`, m);
    }

    participants.splice(index, 1);
    global.db.data.participants[currentDate] = participants;

    await conn.reply(m.chat, `✅ Has sido eliminado de la lista.`, m);

    // Pregunta si desea moverse a un número específico si hay menos de 5 personas en la lista
    if (participants.length < 5) {
        await conn.reply(m.chat, `¿Deseas moverte a un número específico del 5 al 40 en la lista? Responde con el número o 'no'.`, m);
    }
};

// Muestra el menú de opciones
const showMenu = async (m, conn, usedPrefix) => {
    const lugarFecha = moment().tz('America/Lima');
    const formatoFecha = {
        weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    };
    lugarFecha.locale('es', formatoFecha);
    const horarioFecha = lugarFecha.format('dddd, DD [de] MMMM [del] YYYY || HH:mm A').replace(/^\w/, (c) => c.toUpperCase());

    const menu = `⎔ \`\`\`${horarioFecha}\`\`\`
⎔ *Opciones de Lista de Turnos*
⎔ *Selecciona una opción:*
⎔ *Ver Lista* ➺ ${usedPrefix}moslist
⎔ *Ver Lista Completa* ➺ ${usedPrefix}moslistall
⎔ *Salir Lista* ➺ ${usedPrefix}salirlista
⎔ *Borrar Lista* ➺ ${usedPrefix}borrarlista (Solo el dueño del bot)
⎔ *Pago Banco BHD* ➺ ${usedPrefix}pagobhd
⎔ *Pago Banco Popular* ➺ ${usedPrefix}pagopopular
`.trim();

    const buttonParamsJson = JSON.stringify({
        title: "Opciones de Lista de Turnos",
        description: "Seleccione una opción",
        sections: [
            {
                title: "🔖 Opciones", highlight_label: "Popular",
                rows: [
                    { header: "📋 Ver Lista", title: "🔓 Para: Todos", description: "Ver la lista de participantes", id: usedPrefix + "moslist" },
                    { header: "📋 Ver Lista Completa", title: "🔓 Para: Todos", description: "Ver la lista completa de participantes", id: usedPrefix + "moslistall" },
                    { header: "📋 Salir Lista", title: "🔓 Para: Todos", description: "Salir de la lista de participantes", id: usedPrefix + "salirlista" },
                    { header: "🗑️ Borrar Lista", title: "🔒 Para: Dueño", description: "Borrar la lista de participantes", id: usedPrefix + "borrarlista" },
                    { header: "💰 Pago Banco BHD", title: "🔓 Para: Todos", description: "Opciones de pago Banco BHD", id: usedPrefix + "pagobhd" },
                    { header: "💰 Pago Banco Popular", title: "🔓 Para: Todos", description: "Opciones de pago Banco Popular", id: usedPrefix + "pagopopular" }
                ]
            }
        ]
    });

    const interactiveMessage = {
        body: { text: menu },
        footer: { text: `Si algo no funciona utilice el comando *${usedPrefix}menu2*` },
        header: { title: `⭐ *------- MENÚ -------* ⭐\nOpciones de Lista de Turnos`, subtitle: "Seleccione una opción", hasMediaAttachment: true },
        nativeFlowMessage: { buttons: [{ 
            name: "single_select",
            buttonParamsJson
        }]
    }};

    const message = { messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 }, interactiveMessage };
    await conn.relayMessage(m.chat, { viewOnceMessage: { message } }, {});
};

// Comando para agregar participantes
let handler = async (m, { conn, usedPrefix }) => {
    if (m.text.includes('lm')) {
        await handleShowList(m, conn);
    } else {
        await handleAddParticipant(m, conn);
    }
};
handler.command = /^(al|lm)$/i;

export default handler;

// Comando para mostrar la lista
let showListHandler = async (m, { conn }) => {
    await handleShowList(m, conn);
};
showListHandler.command = /^moslist$/i;

export { showListHandler };

// Comando para mostrar la lista completa
let showAllListHandler = async (m, { conn }) => {
    await handleShowAllList(m, conn);
};
showAllListHandler.command = /^moslistall$/i;

export { showAllListHandler };

// Comando para mostrar los comandos del menú
let showMenuCommandsHandler = async (m, { conn }) => {
    await handleShowMenuCommands(m, conn);
};
showMenuCommandsHandler.command = /^menuturnos$/i;

export { showMenuCommandsHandler };

// Comando para borrar la lista
let clearListHandler = async (m, { conn }) => {
    await handleClearList(m, conn);
};
clearListHandler.command = /^borrarlista$/i;

export { clearListHandler };

// Comando para salir de la lista
let removeParticipantHandler = async (m, { conn }) => {
    await handleRemoveParticipant(m, conn);
};
removeParticipantHandler.command = /^salirlista$/i;

export { removeParticipantHandler };