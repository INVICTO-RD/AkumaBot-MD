const handler = async (m, { conn, usedPrefix }) => {
  // Obtén la URL de la foto de perfil o una por defecto
  const who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  const avatar = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://telegra.ph/file/24fa902ead26340f3df2c.png')
  // Construye la URL de la API
  const url = `https://some-random-api.com/canvas/blur?avatar=${encodeURIComponent(avatar)}`
  // Envía el archivo generado por la API
  await conn.sendFile(
    m.chat,
    url,
    'hornycard.png',
    '✨ 𝙀𝙎𝙏𝘼 𝙇𝙄𝙎𝙏𝙊!!\n ৎ୭࠭͢𝔄𝔨𝔲𝔪𝔞-𝔅𝔬𝔱-𝔐𝔇𓆪͟͞  🐉',
    m
  )
}
handler.help = ['blur', 'difuminar2']
handler.tags = ['maker']
handler.command = /^(blur|difuminar2)$/i
export default handler