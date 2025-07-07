import { igdl } from "ruhend-scraper";

let isRestricted = false; // Variable para controlar el estado de restricción

let handler = async (m, { args, conn }) => { 
    const error = '❌'; // Emoji para el error
    const rwait = '⏳'; // Emoji para el estado de espera
    const icons = 'https://spc.unk/G8vtwvFEj9DE3emXZzWbaeMh'; // URL del ícono
    const channel = 'Tu canal aquí'; // Reemplaza esto con el nombre de tu canal
    const textbot = 'Hecho ✅'; // Mensaje adicional que se incluirá al enviar el video

    // Comando para activar o desactivar la restricción
    if (args[0] === 'restrict' && m.sender === ownerNumber) { // Asume que ownerNumber es el número del dueño
        isRestricted = !isRestricted; // Alternar el estado de restricción
        return conn.reply(m.chat, `Restricción ${isRestricted ? 'activada' : 'desactivada'}.`, m);
    }

    // Verificar si el comando está restringido y se está utilizando en privado
    if (isRestricted && m.isPrivate) {
        return conn.reply(m.chat, '⚠️ El uso de este comando está restringido en privado. Usa el comando en un grupo.', m);
    }

    if (!args[0]) {
        return conn.reply(m.chat, '🔗 *Ingresa un link de Instagram*', m); // Eliminado rcanal
    }

    let videoSent = false; // Variable para rastrear si el video fue enviado

    try {
        await m.react(rwait);
        conn.reply(m.chat, `🕒 *Enviando El Video...*`, m, {
            contextInfo: { externalAdReply: { mediaUrl: null, mediaType: 1, showAdAttribution: true,
            title: packname,
            body: wm,
            previewType: 0, thumbnail: icons,
            sourceUrl: channel }}});
        
        let res = await igdl(args[0]);
        let data = res.data;       
        for (let media of data) {
            await new Promise(resolve => setTimeout(resolve, 2000));           
            await conn.sendFile(m.chat, media.url, 'instagram.mp4', '🎞️ *Tu video de instagram.*\n' + textbot, fkontak);
            videoSent = true; // Marcar que el video fue enviado
        }
    } catch (e) {
        console.error(e); // Imprimir el error en la consola para depuración
        await m.react(error);
        if (!videoSent) { // Solo enviar el mensaje de error si no se envió el video
            conn.reply(m.chat, '⚙️ Ocurrió un error al intentar enviar el video.', m); // Eliminado fake
        } else {
            conn.reply(m.chat, '⚙️ El video se envió, pero hubo un problema adicional.', m); // Eliminado fake
        }
    }
}

// Permitir el uso del comando en chats privados y grupos
handler.command = ['instagram2','ig','ig2'];
handler.tags = ['descargas'];
handler.help = ['instagram2', 'ig2'];

// No establecer restricciones de grupo o privado
// handler.group = true; // No necesario
// handler.private = true; // No necesario

export default handler;