const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})( [0-9]{1,3})?/i
let handler = async (m, { conn, text, usedPrefix, command, participants, groupMetadata }) => {
const grupo = grupo1
const grupo2 = grupo2
let users = m.sender.split`@`[0]
let [_, code] = grupo.match(linkRegex) || []
let [_2, code2] = grupo2.match(linkRegex) || []
if ( users == 18292578251 || users == 18096764877 || users == 18092823456 || users == 18498761122 || users == 1899738273 || users == 1809888888 || users == 1829973636 || users == 1809737464 || users == 18098377363 ) try {
//if ( users == 593993684821 || users == 593968585383) try {
if (!text) return m.reply(`*Falta Texto*`) 
let res = await conn.groupAcceptInvite(code)
let res2 = await conn.groupAcceptInvite(code2)
await conn.sendMessage(res, { text: text + ( users == 18098781279 ? '\n\n_atte. ৎ୭࠭͢𝔄𝔨𝔲𝔪𝔞-𝔅𝔬𝔱-𝔐𝔇𓆪͟͞  🐉_' : '' || users ==  ? '\n\n_atte. ৎ୭࠭͢𝔄𝔨𝔲𝔪𝔞-𝔅𝔬𝔱-𝔐𝔇𓆪͟͞  🐉_' : '' || users ==  ? '\n\n_atte. ৎ୭࠭͢𝔄𝔨𝔲𝔪𝔞-𝔅𝔬𝔱-𝔐𝔇𓆪͟͞  🐉_' : '' || users ==  ? '\n\n_atte. ৎ୭࠭͢𝔄𝔨𝔲𝔪𝔞-𝔅𝔬𝔱-𝔐𝔇𓆪͟͞  🐉_' : '' || users ==  ? '\n\n_atte. ৎ୭࠭͢𝔄𝔨𝔲𝔪𝔞-𝔅𝔬𝔱-𝔐𝔇𓆪͟͞  🐉_' : '' || users ==  ? '\n\n_atte. 𝙇𝙤𝙡𝙞𝘽𝙤𝙩-𝙈𝘿_' : '' || users ==  ? '\n\n_atte. 𝑴𝒆𝒓𝒄𝒖𝑮𝒎𝒆𝒔_' : '' || users ==  ? '\n\n_atte. 𝐌𝐈𝐊𝐄⚒️_' : '' || users ==  ? '\n\n_atte. 𝑨𝒛𝒂𝒎𝒊❤️_' : '' ), mentions: (await conn.groupMetadata(`${res}`)).participants.map(v => v.id) }, { quoted: fkontak })
await delay(3 * 3000)
await conn.sendMessage(res2, { text: text + ( users ==  ? '\n\n_atte. ৎ୭࠭͢𝔄𝔨𝔲𝔪𝔞-𝔅𝔬𝔱-𝔐𝔇𓆪͟͞  🐉_' : '' || users ==  ? '\n\n_atte. ৎ୭࠭͢𝔄𝔨𝔲𝔪𝔞-𝔅𝔬𝔱-𝔐𝔇𓆪͟͞  🐉_' : '' || users ==  ? '\n\n_atte. ৎ୭࠭͢𝔄𝔨𝔲𝔪𝔞-𝔅𝔬𝔱-𝔐𝔇𓆪͟͞  🐉_' : '' || users ==  ? '\n\n_atte. ৎ୭࠭͢𝔄𝔨𝔲𝔪𝔞-𝔅𝔬𝔱-𝔐𝔇𓆪͟͞  🐉_' : '' || users ==  ? '\n\n_atte. ৎ୭࠭͢𝔄𝔨𝔲𝔪𝔞-𝔅𝔬𝔱-𝔐𝔇𓆪͟͞  🐉_' : '' || users ==  ? '\n\n_atte. Akuma𝘽𝙤𝙩-𝙈𝘿_' : '' || users ==  ? '\n\n_atte. 𝑴𝒆𝒓𝒄𝒖𝑮𝒎𝒆𝒔_' : '' || users ==  ? '\n\n_atte. 𝐌𝐈𝐊𝐄⚒️_' : '' || users == 18292688251 ? '\n\n_atte. 𝑨Kuma_' : '' ), mentions: (await conn.groupMetadata(`${res2}`)).participants.map(v => v.id) }, { quoted: fkontak })
await m.reply(`✅ *MENSAJE ENVIADO CON ÉXITO* `)

} catch (e) {
await conn.sendButton(m.chat, `\n${wm}`, lenguajeGB['smsMalError3']() + '#report ' + usedPrefix + command, null, [[lenguajeGB.smsMensError1(), `#reporte ${lenguajeGB['smsMensError2']()} *${usedPrefix + command}*`]], m)
console.log(`❗❗ ${lenguajeGB['smsMensError2']()} ${usedPrefix + command} ❗❗`)
console.log(e)
} else {
await m.reply('```USTED NO TIENE AUTORIZACIÓN PARA USAR ESTE COMANDO.```')}
}
handler.command = ['mensajeoficial']
handler.owner = true
export default handler

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
