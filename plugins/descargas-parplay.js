import yts from 'yt-search';

const emoji = '🎵';
const dev = '© 𝒫𝑜𝓌𝑒𝓇𝑒𝒹 𝐵𝓎 Ⱥղէօղìօ';
const rwait = '⏳';
const done = '✅';

const handler = async (m, { conn, text, command }) => {
  if (!text) throw `${emoji} *Por favor ingresa la música que deseas descargar.*`;

  const isVideo = /vid|2|mp4|v$/.test(command);
  const search = await yts(text);

  if (!search.all || search.all.length === 0) {
    throw "*No se encontraron resultados para tu búsqueda.*";
  }

  const videoInfo = search.all[0];
  const body = formatMessage(videoInfo);

  try {
    if (['play', 'play2', 'playvid'].includes(command)) {
      await handlePlayCommand(m, conn, videoInfo, body);
    } else if (['yta', 'ytmp3'].includes(command)) {
      await handleAudioDownload(m, conn, videoInfo);
    } else if (['ytv', 'ytmp4'].includes(command)) {
      await handleVideoDownload(m, conn, videoInfo);
    } else {
      throw "Comando no reconocido.";
    }
  } catch (error) {
    return m.reply(`⚠︎ Ocurrió un error: ${error.message}`);
  }
};

const formatMessage = (videoInfo) => {
  return `「✦」ძᥱsᥴᥲrgᥲᥒძ᥆ *<${videoInfo.title}>*\n\n` +
    `> ✦ ᥴᥲᥒᥲᥣ » *${videoInfo.author.name || 'Desconocido'}*\n` +
    `> ✰ ᥎іs𝗍ᥲs » *${formatViews(videoInfo.views)}*\n` +
    `> ⴵ ძᥙrᥲᥴі᥆ᥒ » *${videoInfo.timestamp}*\n` +
    `> ✐ ⍴ᥙᑲᥣіᥴᥲძ᥆ » *${videoInfo.ago}*\n` +
    `> 🜸 ᥣіᥒk » ${videoInfo.url}\n`;
};

const handlePlayCommand = async (m, conn, videoInfo, body) => {
  await conn.sendMessage(m.chat, {
    image: { url: videoInfo.thumbnail },
    caption: body,
    footer: dev,
    buttons: [
      {
        buttonId: `.yta ${videoInfo.url}`,
        buttonText: { displayText: 'ᯓᡣ𐭩 ᥲᥙძі᥆' },
      },
      {
        buttonId: `.ytv ${videoInfo.url}`,
        buttonText: { displayText: 'ᯓᡣ𐭩 ᥎іძᥱ᥆' },
      },
    ],
    viewOnce: true,
    headerType: 4,
  }, { quoted: m });
  m.react('🕒');
};

const handleAudioDownload = async (m, conn, videoInfo) => {
  m.react(rwait);
  const audioUrl = await fetchMedia(videoInfo.url, 'mp3');
  if (!audioUrl) throw "No se pudo obtener el audio.";
  conn.sendFile(m.chat, audioUrl, videoInfo.title, '', m);
  m.react(done);
};

const handleVideoDownload = async (m, conn, videoInfo) => {
  m.react(rwait);
  const videoUrl = await fetchMedia(videoInfo.url, 'mp4');
  if (!videoUrl) throw "No se pudo obtener el video.";
  await conn.sendMessage(m.chat, {
    video: { url: videoUrl },
    mimetype: "video/mp4",
    caption: ``,
  }, { quoted: m });
  m.react(done);
};

const fetchMedia = async (url, type) => {
  const apiUrls = [
    `https://api.alyachan.dev/api/youtube?url=${url}&type=${type}&apikey=Gata-Dios`,
    `https://delirius-apiofc.vercel.app/download/yt${type}?url=${url}`,
    `https://api.vreden.my.id/api/yt${type}?url=${url}`
  ];

  for (const apiUrl of apiUrls) {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.data && data.data.url) return data.data.url;
    } catch (error) {
      continue; // Intenta la siguiente API si hay un error
    }
  }
  return null; // Si ninguna API funcionó
};

const formatViews = (views) => {
  return views >= 1000 ? (views / 1000).toFixed(1) + 'k (' + views.toLocaleString() + ')' : views.toString();
};

handler.help = ['play', 'playvid', 'ytv', 'ytmp4', 'yta', 'play2', 'ytmp3'];
handler.command = ['play', 'playvid', 'ytv', 'ytmp4', 'yta', 'play2', 'ytmp3'];
handler.tags = ['dl'];
handler.register = true;

export default handler;

const getVideoId = (url) => {
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11}).*/;
  const match = url.match(regex);
  if (match) {
    return match[1];
  }
  throw new Error("Invalid YouTube URL");
};