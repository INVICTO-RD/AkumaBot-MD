import axios from "axios";
import FormData from "form-data";
import cheerio from "cheerio";

let handler = async (m, { conn, usedPrefix, command, text, args }) => {
    if (!text) return conn.reply(m.chat, '*\`Ingresa El link Del vídeo a descargar ✨\`*', m); // Eliminado rcanal

    try {
        let data = await tiktokdl(text);
        console.log(data);
        
        // Start time for performance measurement
        let start = Date.now();
        let sp = (Date.now() - start) + 'ms';
        
        let cap = `*\`[ TIKTOK CALIDAD NORMAL ]\`*`;
        let capp = `*\`[ TIKTOK CALIDAD HD ]\`*`;
        
        await m.react('🕓');
        
        // Send normal quality video
        await conn.sendMessage(m.chat, {
            video: { url: data.server1.url },
            caption: cap
        }, { quoted: m });
        
        // Send HD quality video
        await conn.sendMessage(m.chat, {
            video: { url: data.serverHD.url },
            caption: capp
        }, { quoted: m });
        
        // React with success emoji
        await m.react('✅');
    } catch (error) {
        console.error(error); // Log the error for debugging
        await m.react('✖️'); // React with error emoji
    }
}

handler.help = ['tiktok2 *<link>*'];
handler.tags = ['descargas'];
handler.command = /^(tiktok2)$/i;

export default handler;

async function tiktokdl(url) {
    let result = {};
    let form = new FormData();
    form.append("q", url);
    form.append("lang", "id");

    try {
        let { data } = await axios("https://savetik.co/api/ajaxSearch", {
            method: "post",
            data: form,
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                "User-Agent": "PostmanRuntime/7.32.2"
            }
        });

        let $ = cheerio.load(data.data);

        result.status = true;
        result.caption = $("div.video-data > div > .tik-left > div > .content > div > h3").text();
        result.server1 = {
            quality: "MEDIUM",
            url: $("div.video-data > div > .tik-right > div > p:nth-child(1) > a").attr("href")
        };
        result.serverHD = {
            quality: $("div.video-data > div > .tik-right > div > p:nth-child(3) > a").text().split("MP4 ")[1],
            url: $("div.video-data > div > .tik-right > div > p:nth-child(3) > a").attr("href")
        };
        result.audio = $("div.video-data > div > .tik-right > div > p:nth-child(4) > a").attr("href");

    } catch (error) {
        result.status = false;
        result.message = error;
        console.log(result);
    }

    return result;
}