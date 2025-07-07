
let handler = async (m, { conn, usedPrefix }) => {
    let who;

    // Determina quién es el usuario objetivo
    if (m.mentionedJid.length > 0) {
        who = m.mentionedJid[0]; 
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        who = m.sender; 
    }

    let name = conn.getName(who); 
    let name2 = conn.getName(m.sender); 
    m.react('🥵');

    // Crea el mensaje dependiendo de cómo se mencionó al usuario
    let str;
    if (m.mentionedJid.length > 0) {
        str = `\`${name2}\` *está haciendo un 69 con* \`${name}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` *hizo un 69 con* \`${name}\.`; 
    } else {
        str = `\`${name2}\` *está haciendo un 69! >.<.*`.trim();
    }

    // Solo ejecuta si el mensaje es en grupo
    if (m.isGroup) {
        const videos = [
            'https://telegra.ph/file/bb4341187c893748f912b.mp4', 
            'https://telegra.ph/file/c7f154b0ce694449a53cc.mp4', 
            'https://telegra.ph/file/1101c595689f638881327.mp4',
            'https://telegra.ph/file/f7f2a23e9c45a5d6bf2a1.mp4',
            'https://telegra.ph/file/a2098292896fb05675250.mp4',
            'https://telegra.ph/file/16f43effd7357e82c94d3.mp4',
            'https://telegra.ph/file/55cb31314b168edd732f8.mp4',
            'https://telegra.ph/file/1cbaa4a7a61f1ad18af01.mp4',
            'https://telegra.ph/file/1083c19087f6997ec8095.mp4'
        ];
        
        // Selecciona un video aleatorio
        const video = videos[Math.floor(Math.random() * videos.length)];
     
        let mentions = [who]; 
        try {
            // Envía el video con el mensaje
            await conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
        } catch (error) {
            console.error('Error al enviar el video:', error);
            m.reply('❌ Ocurrió un error al intentar enviar el video.');
        }
    }
}

// Cambia la etiqueta a 'modohorny'
handler.help = ['sixnine @tag'];
handler.tags = ['modohorny'];
handler.command = ['sixnine', '69'];
handler.group = true;

// Habilitar el modo horny
export default handler;
