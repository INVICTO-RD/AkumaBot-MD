import fetch from 'node-fetch';

var handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) {
    return conn.reply(m.chat, `『🐉』𝙄𝙣𝙜𝙧𝙚𝙨𝙚 𝙪𝙣 𝙩𝙚𝙭𝙩𝙤 𝙥𝙖𝙧𝙖 𝙪𝙨𝙖𝙧 𝙚𝙨𝙩𝙚 𝙘𝙤𝙢𝙖𝙣𝙙𝙤.\n\n• 𝙋𝙤𝙧 𝙚𝙟𝙚𝙢𝙥𝙡𝙤:\n${usedPrefix + command} Hola`, m);
  }

  try {
    await m.react('⏳');
    conn.sendPresenceUpdate('composing', m.chat);

    const response = await fetch(`https:                                                                                     

    if (!response.ok) {
      throw new Error(`//apis-starlights-team.koyeb.app/starlight/gemini?text=${encodeURIComponent(text)}`);

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
    }

    const res = await response.json();
    console.log(res);

    if (res && res.result) {
      await m.reply(res.result);
    } else {
      await m.reply('🐉 *No se recibió una respuesta válida de la IA.*');
    }
  } catch (error) {
    console.error(error);
    await m.react('❌');
    await conn.reply(m.chat, `『⚙️』𝙊𝙘𝙪𝙧𝙧𝙞𝙤 𝙪𝙣 𝙚𝙧𝙧𝙤𝙧 𝙚𝙣 𝙚𝙡 𝙘𝙤𝙢𝙖𝙣𝙙𝙤, 𝙧𝙚𝙥𝙤𝙧𝙩𝙖𝙡𝙤 𝙖𝙡 𝙘𝙧𝙚𝙖𝙙𝙤𝙧 𝙙𝙚𝙡 𝙗𝙤𝙩.`, m);
  }
};

handler.command = ['gemini'];
handler.help = ['gemini'];
handler.tags = ['ai'];

export default handler;