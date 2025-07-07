import { createHash } from 'crypto';
import PhoneNumber from 'awesome-phonenumber';
import fs from 'fs';

const loadMarriages = () => {
    if (fs.existsSync('./src/database/marry.json')) {
        const data = JSON.parse(fs.readFileSync('./src/database/marry.json', 'utf-8'));
        global.db.data.marriages = data;
    } else {
        global.db.data.marriages = {};
    }
};

const handler = async (m, { conn }) => {
    loadMarriages();

    let who = m.quoted?.sender || m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender);
    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => './src/avatar_contact.png'); // Imagen del usuario

    let userData = global.db.data.users[who] || {};
    let { premium, level, genre = 'No especificado', birth = 'No Establecido', description = 'Sin Descripción', exp = 0, registered, age = 'Sin especificar', role = 'Aldeano', akumacoin = 0 } = userData;
    let username = conn.getName(who);
    let hashId = createHash('md5').update(who).digest('hex'); // Número de serie
    let phoneNumber = PhoneNumber('+' + who.replace('@s.whatsapp.net', '')).getNumber('international'); // Número de teléfono

    let isMarried = who in global.db.data.marriages;
    let partnerName = isMarried ? conn.getName(global.db.data.marriages[who]) : 'Nadie';

    // Texto del perfil del usuario
    let profileText = `
「 👤 *PERFIL DE USUARIO* 」
☁️ *Nombre:* ${username}
💠 *Edad:* ${registered ? age : 'Sin especificar'}
⚧️ *Género:* ${genre}
🎂 *Cumpleaños:* ${birth} 
👩‍❤️‍👩 *Casad@:* ${partnerName}
📜 *Descripción:* ${description}
🌀 *Registrado:* ${registered ? '✅' : '❌'}
🔢 *Número de Serie:* *${hashId}*
🔗 *Enlace:* wa.me/${who.split`@`[0]}

「 💰 *RECURSOS* 」
🪙 *Akumacoin:* ${akumacoin}
🌟 *Nivel:* ${level}
✨ *Experiencia:* ${exp}
⚜️ *Rango:* ${role}
👑 *Premium:* ${premium ? '✅' : '❌'}
`.trim();

    conn.sendFile(m.chat, pp, 'perfil.jpg', profileText, m, { mentions: [who] });
}

handler.help = ['profile', 'perfil'];
handler.register = true;
handler.group = true;
handler.tags = ['rg', 'xp'];
handler.command = /^perfil|profile?$/i;

export default handler;