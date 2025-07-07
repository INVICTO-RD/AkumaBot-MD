const handler = async (m, { conn, isAdmin, groupMetadata }) => {
    // Verificar si el mensaje proviene del propio bot
    if (m.fromMe) throw 'No puedes auto-promocionarte.';

    // Si el usuario ya es administrador, enviar un mensaje y salir
    if (isAdmin) {
        return m.reply('✨ _*¡MI SR. AMO 😄 YA TE DI MI POWER 💪, APROVECHALO AL MAX!*_');
    }

    try {
        // Promover al usuario a administrador
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
        
        // Reaccionar al mensaje y enviar una respuesta
        await m.react('✅'); // Reacción de éxito
        m.reply('✨ _*¡MI SR. AMO YA TE DI MI POWER 💪, APROVECHALO AL MAX!*_');

        // Obtener el nombre del usuario que se ha promovido
        const userName = conn.getName(m.sender);

        // Notificar en un canal específico sobre la promoción
        conn.reply('18098781279@s.whatsapp.net', `🚩 *${userName}* se dio Auto Admin en:\n> ${groupMetadata.subject}.`, m);
    } catch (error) {
        console.error('Error al promover al usuario:', error);
        m.reply('❌ Ocurrió un error al intentar promoverte.');
    }
};

// Definición de etiquetas y comandos
handler.tags = ['mods'];
handler.help = ['autoadmin'];
handler.command = ['autoadmin', 'damepower', 'tenerpoder'];
handler.mods = true;
handler.group = true;
handler.botAdmin = true;

export default handler;