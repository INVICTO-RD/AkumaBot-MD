import fetch from 'node-fetch';
import axios from 'axios';
import cheerio from 'cheerio';

const handler = async (m, { conn, args, command, usedPrefix }) => {
    // Se elimina la comprobaci贸n NSFW completamente
    if (!args[0]) {
        return conn.reply(m.chat, `*[鉂楌潗堭潗嶐潗咅潗庘潡]*\n\n鈽侊笍 *Instrucciones:* \nPara buscar videos en Xvideos, por favor ingresa un t茅rmino de b煤squeda.\nEjemplo: \n*${usedPrefix + command} perro*`, m);
    }

    try {
        const results = await xvideosSearch(args.join(' '));
        if (results.length === 0) {
            return conn.reply(m.chat, `*[鉂楌潗堭潗嶐潗咅潗庘潡]*\nNo se encontraron resultados para: *${args.join(' ')}*`, m);
        }

        let responseMessage = `馃悏 *Resultados de b煤squeda para:* *${args.join(' ')}*\n\n`;
        results.forEach((video, index) => {
            responseMessage += `鈽侊笍 *T铆tulo:* ${video.title}\n`;
            responseMessage += `馃晵 *Duraci贸n:* ${video.duration}\n`;
            responseMessage += `馃帪锔� *Calidad:* ${video.quality || 'No disponible'}\n`;
            responseMessage += `馃敆 *Enlace:* ${video.url}\n\n`;
        });

        conn.reply(m.chat, responseMessage, m);
    } catch (e) {
        console.error(e);
        return conn.reply(m.chat, `*[鉂楌潗堭潗嶐潗咅潗庘潡]*\nOcurri贸 un error al buscar videos. Por favor, intenta de nuevo m谩s tarde.`, m);
    }
};

handler.command = ['xvideossearch', 'xvsearch'];
handler.register = true;
handler.group = false;
// Puedes agregar limit si lo deseas
// handler.limit = true;

export default handler;

async function xvideosSearch(query) {
    return new Promise(async (resolve, reject) => {
        try {
            const url = `https://www.xvideos.com/?k=${encodeURIComponent(query)}`;
            const response = await axios.get(url);
            const $ = cheerio.load(response.data);

            const results = [];
            $("div.mozaique > div").each((index, element) => {
                const title = $(element).find("p.title a").attr("title");
                const videoUrl = "https://www.xvideos.com" + $(element).find("p.title a").attr("href");
                const duration = $(element).find("span.duration").text().trim();
                const quality = $(element).find("span.video-hd-mark").text().trim();

                results.push({ title, url: videoUrl, duration, quality });
            });

            resolve(results);
        } catch (error) {
            reject(error);
        }
    });
}