
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
    let who;

    // Verificar si el modo horny est¨¢ activado
    let chat = global.db.data.chats[m.chat];
    if (!chat.modohorny && m.isGroup) {
        return m.reply('*[?] ??? ???????? +?? ?????? ???????????? ?? ???? ?????.*\n> ?? ?? ????? ? ????? ?????????? ??? .enable modohorny');
    }

    if (m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        who = m.sender;
    }

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    m.react('?');

    let str;
    if (m.mentionedJid.length > 0) {
        str = `\`${name2}\` *le est¨¢ lamiendo el co?o a* \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` *le chup¨® el co?o a* \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` *est¨¢ lamiendo un co?o! >.<*`.trim();
    }
    
    if (m.isGroup) {
        let pp = 'https://qu.ax/LPcsZ.mp4'; 
        let pp2 = 'https://qu.ax/OvlTU.mp4'; 
        let pp3 = 'https://qu.ax/gaZHP.mp4';
        let pp4 = 'https://qu.ax/PSBkz.mp4';
        let pp5 = 'https://qu.ax/Kejmn.mp4';
        let pp6 = 'https://qu.ax/SFFq.mp4';
        let pp7 = 'https://qu.ax/EDZBg.mp4';
        let pp8 = 'https://qu.ax/Smfz.mp4';
        
        const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8];
        const video = videos[Math.floor(Math.random() * videos.length)];

        let mentions = [who];
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['lickpussy/co?o @tag'];
handler.tags = ['modohorny'];
handler.command = ['lickpussy', 'co?o'];
handler.group = true;

export default handler;
