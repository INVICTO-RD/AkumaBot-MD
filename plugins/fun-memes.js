/* ig : https://www.instagram.com/fg98._/ */
import hispamemes from 'hispamemes'

let handler = async (m, { conn, usedPrefix, command }) => {
  const meme = hispamemes.meme()
  conn.sendFile(m.chat, meme, '', '', fkontak)
  const emoji2 = '😂'; // Define emoji2 aquí con el emoji que desees usar.
  m.react(emoji2)
}

handler.help = ['meme']
handler.tags = ['fun']
handler.command = ['meme', 'memes']
handler.yenes = 1
handler.group = true;
handler.register = true
export default handler