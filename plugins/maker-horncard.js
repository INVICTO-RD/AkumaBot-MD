const handler = async (m, { conn }) => {
  // Identifica el usuario objetivo para el avatar
  const who = m.quoted 
    ? m.quoted.sender 
    : (m.mentionedJid && m.mentionedJid[0]) 
      ? m.mentionedJid[0] 
      : m.fromMe 
        ? conn.user.jid 
        : m.sender;

  // Intenta obtener el avatar, o usa un placeholder si falla
  const avatarUrl = await conn.profilePictureUrl(who, 'image')
    .catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');

  // Construye la URL de la API de forma directa, sin global.API
  const apiUrl = `https://some-random-api.com/canvas/horny?avatar=${encodeURIComponent(avatarUrl)}`;

  // Envía la imagen generada
  await conn.sendFile(
    m.chat, 
    apiUrl, 
    'hornycard.png', 
    '*TÚ ESTÁS HORNY 🥵🔥*', 
    m
  );
};

handler.help = ['hornycard', 'hornylicense'];
handler.tags = ['maker'];
handler.command = /^(horny(card|license))$/i;

export default handler;