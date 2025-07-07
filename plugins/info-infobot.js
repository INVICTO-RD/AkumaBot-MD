import db from '../lib/database.js';
import { cpus as _cpus, totalmem, freemem, platform, hostname } from 'os';
import speed from 'performance-now';
import { sizeFormatter } from 'human-readable';

// Definición de icons
const icons = 'https://files.fm/u/cnssrgepzv'; // Reemplaza con la URL de tu icono

// Definición de redes
const redes = 'https://whatsapp.com/channel/0029VawDxVnLSmbbtn80cI2F'; // Reemplaza con la URL de tus redes sociales

let format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

let handler = async (m, { conn, usedPrefix }) => {
  let bot = global.db.data.settings[conn.user.jid];
  let _uptime = process.uptime() * 1000;
  let uptime = new Date(_uptime).toISOString().substr(11, 8); // Formato de tiempo
  let totalreg = Object.keys(global.db.data.users).length;
  let totalbots = Object.keys(global.db.data.settings).length;
  let totalStats = Object.values(global.db.data.stats).reduce((total, stat) => total + stat.total, 0);
  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats);
  let totalchats = Object.keys(global.db.data.chats).length;
  let totalf = Object.values(global.plugins).filter((v) => v.help && v.tags).length;
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'));
  const used = process.memoryUsage();

  // Calcular latencia
  let timestamp = speed(); // Marca el tiempo de inicio
  let latensi = speed() - timestamp; // Calculando latencia

  // Generación del mensaje
  let goku = `╭─⬣「 *Info De Akuma* 」⬣\n`;
  goku += `│ 👑 *Creador* : @${owner[0][0].split('@s.whatsapp.net')[0]}\n`;
  goku += `│ 🍭 *Prefijo* : [  ${usedPrefix}  ]\n`;
  goku += `│ 📦 *Total Plugins* : ${totalf}\n`;
  goku += `│ 💫 *Plataforma* : ${platform()}\n`;
  goku += `│ 🧿 *Servidor* : ${hostname()}\n`;
  goku += `│ 🚀 *RAM* : ${format(totalmem() - freemem())} / ${format(totalmem())}\n`;
  goku += `│ 🌟 *FreeRAM* : ${format(freemem())}\n`;
  goku += `│ ✨️ *Speed* : ${latensi.toFixed(4)} ms\n`;
  goku += `│ 🕗 *Uptime* : ${uptime}\n`;
  goku += `│ 🍟 *Modo* : ${bot.public ? 'Privado' : 'Publico'}\n`;
  goku += `│ 🚩 *Comandos Ejecutados* : ${toNum(totalStats)} ( *${totalStats}* )\n`;
  goku += `│ 🐢 *Grupos Registrados* : ${toNum(totalchats)} ( *${totalchats}* )\n`;
  goku += `│ 🍧 *Registrados* : ${toNum(totalreg)} ( *${totalreg}* ) Usuarios\n`;
  goku += `╰─⬣\n\n`;
  
  await conn.reply(m.chat, goku, fkontak, { 
    contextInfo: { 
      mentionedJid: [owner[0][0] + '@s.whatsapp.net'], 
      externalAdReply: { 
        mediaUrl: false, 
        mediaType: 1, 
        description: false, 
        title: '↷✦╎Info - Bot╎🚩˖ ⸙',
        body: false, 
        previewType: 0, 
        thumbnail: icons, 
        sourceUrl: redes // Asegúrate de que `redes` esté definido
      }
    }
  });
};

handler.help = ['infobot'];
handler.tags = ['info'];
handler.command = ['info', 'infobot'];

export default handler;

function toNum(number) {
  if (number >= 1000 && number < 1000000) {
    return (number / 1000).toFixed(1) + 'k';
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number <= -1000 && number > -1000000) {
    return (number / 1000).toFixed(1) + 'k';
  } else if (number <= -1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else {
    return number.toString();
  }
}