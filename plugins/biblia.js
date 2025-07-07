import fetch from 'node-fetch';

let handler = async (m, { conn, command, text, usedPrefix }) => {
  // Modo Biblia Random (br)
  if (command === 'br') {
    await m.react('🕓');

    try {
      // Petición al endpoint para obtener un versículo aleatorio
      let res = await fetch('https://api.davidcyriltech.my.id/bible/random?translation=spanish');

      // Verificar el estado de la respuesta HTTP
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status} ${res.statusText}`);
      }

      let json = await res.json();

      // Verificar que la respuesta contiene datos válidos
      if (!json.success || !json.text) {
        throw new Error('La respuesta no contiene datos válidos.');
      }

      let txt = '`乂  B Í B L I A  乂`';
      txt += `\n\n  *» Referencia* : ${json.reference}\n`;
      txt += `  *» Traducción* : ${json.translation}\n`;
      txt += `  *» Contenido* : ${json.text.trim()}\n`;

      await conn.reply(m.chat, txt, m);
      await m.react('✅');
    } catch (error) {
      console.error('Error al obtener un versículo aleatorio:', error.message);
      await m.react('✖️');
      return conn.reply(m.chat, 'Hubo un problema al obtener un versículo aleatorio. Inténtalo más tarde.', m);
    }
  } else {
    // Modo búsqueda de referencia específica
    if (!text || text.trim() === '') {
      return conn.reply(
        m.chat,
        '🚩 Por favor, ingresa la referencia bíblica que deseas buscar.\n\nEjemplo:\n' +
        `> *${usedPrefix + command}* juan 3:16`,
        m
      );
    }

    await m.react('🕓');

    try {
      // Petición al endpoint para buscar referencia específica
      let res = await fetch(`https://api.davidcyriltech.my.id/bible?reference=${encodeURIComponent(text)}&translation=spanish`);

      // Verificar el estado de la respuesta HTTP
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status} ${res.statusText}`);
      }

      let json = await res.json();

      // Verificar que la respuesta contiene datos válidos
      if (!json.success || !json.text) {
        throw new Error('La respuesta no contiene datos válidos.');
      }

      let txt = '`乂  B Í B L I A  乂`';
      txt += `\n\n  *» Referencia* : ${json.reference}\n`;
      txt += `  *» Traducción* : ${json.translation}\n`;
      txt += `  *» Contenido* : ${json.text.trim()}\n`;

      await conn.reply(m.chat, txt, m);
      await m.react('✅');
    } catch (error) {
      console.error('Error al buscar referencia específica:', error.message);
      await m.react('✖️');
      return conn.reply(m.chat, 'Hubo un problema al procesar tu solicitud. Inténtalo más tarde.', m);
    }
  }
};

handler.help = ['biblia *<referencia>*', 'br'];
handler.tags = ['search'];
handler.command = ['biblias', 'br'];
handler.register = true;

export default handler;