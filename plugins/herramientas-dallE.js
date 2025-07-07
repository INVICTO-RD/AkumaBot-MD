import axios from 'axios';

const handler = async (m, { conn, args }) => {
    if (!args[0]) {
        await conn.reply(m.chat, `${lenguajeGB['smsAvisoMG']()} *𝙄𝙉𝙂𝙍𝙀𝙎𝙀 𝙐𝙉 𝙏𝙀𝙓𝙏𝙊 𝙋𝘼𝙍𝘼 𝘾𝙍𝙀𝘼𝙍 𝙐𝙉𝘼 𝙄𝙈𝘼𝙎𝙀𝙉 𝘾𝙊𝙉 𝘿𝘼𝙇𝙇-𝙀 (𝙄𝘼)\n\n*ღ 𝙀𝙅𝙀𝙈𝙋𝙇𝙊:\n*ɞ ${usedPrefix + command} gatitos llorando*\n*ɞ ${usedPrefix + command} Un gato de color morado con celeste estando en Júpiter, iluminando el cosmo con su encanto con un efecto minimalista.*`, m);
        return;
    }

    const prompt = args.join(' ');
    const apiUrl = `https://eliasar-yt-api.vercel.app/api/ai/text2img?prompt=${prompt}`;

    try {
        await m.react('⏳');
        await conn.sendMessage(m.chat, { text: '*⌛ ESPERE UN MOMENTO POR FAVOR...*' }, { quoted: m });

        // Configura un timeout de 10 segundos (10000 milisegundos)
        const response = await axios.get(apiUrl, {
            responseType: 'arraybuffer',
            timeout: 10000, // 10 segundos
        });

        await conn.sendMessage(m.chat, { image: Buffer.from(response.data) }, { quoted: m });
        await m.react('✅');
    } catch (error) {
        console.error('Error al generar la imagen:', error);
        await m.react('❌');
        if (error.code === 'ECONNABORTED') {
            await conn.reply(m.chat, '❌ La solicitud tardó demasiado en responder, intente nuevamente.', m);
        } else {
            await conn.reply(m.chat, '❌ No se pudo generar la imagen, intenta nuevamente más tarde.', m);
        }
    }
};

handler.command = ['dalle', 'dall-e'];
handler.help = ['dalle', 'dall-e'];
handler.tags = ['tools'];

export default handler;