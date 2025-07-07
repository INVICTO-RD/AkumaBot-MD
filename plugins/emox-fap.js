import axios from 'axios';
import puppeteer from 'puppeteer';

const handler = async (m, { conn, text }) => {
    const codeRegex = /^(\.CRJ|jcr|playerc royal) (\d{4,})$/i;
    const match = text.match(codeRegex);

    if (!match) {
        conn.reply(
            m.chat,
            '_Por favor ingresa un código de jugador válido de Clash Royale. Ejemplo: .CRJ 2640_',
            m
        );
        return;
    }

    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6Ijk0MzA0NDYwLTFkN2UtNGYzYi04ODM2LWY5MjFkNzlhMzgxMiIsImlhdCI6MTc0NDMyMjYzOCwic3ViIjoiZGV2ZWxvcGVyLzRlMzE1MDg4LWJjZDUt ZTU3MS0yNWQxLTRiYjc2NTg4MGNlNCIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI0NS43OS4yMTguNzkiXSwidHlwZSI6ImNsaWVudCJ9XX0.uebZ6L06NIkl1ZkS-v0sU-G10gfL_2bEcl8AocZGfCYhTulJxuXjEUjY6qm9ON9uyfBkhLxOkJJCu--4NMgOYg';
    const playerId = match[2];
    const apiUrl = `https://proxy.royaleapi.dev/v1/players/%23${playerId}`;

    try {
        const playerInfo = await fetchPlayerInfo(apiUrl, token);

        // Pregunta al usuario si quiere recibir la información por texto o imagen
        conn.reply(
            m.chat,
            '_¿Quieres recibir la información como texto o como imagen? Responde con "texto" o "imagen"._',
            m
        );

        conn.on('chat-update', async (response) => {
            const option = response.text?.toLowerCase();

            if (option === 'texto') {
                const message = formatPlayerInfoMessage(playerInfo);
                conn.reply(m.chat, message, m);
            } else if (option === 'imagen') {
                const imageBuffer = await generatePlayerImage(playerInfo);
                conn.sendMessage(m.chat, imageBuffer, 'image', {
                    caption: 'Aquí está la información del jugador.',
                });
            } else {
                conn.reply(
                    m.chat,
                    '_Opción no válida. Por favor responde con "texto" o "imagen"._',
                    m
                );
            }
        });
    } catch (error) {
        handleError(error, conn, m);
    }
};

// Función para obtener la información del jugador desde la API
const fetchPlayerInfo = async (url, token) => {
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};

// Función para formatear la información del jugador como texto
const formatPlayerInfoMessage = (playerInfo) => {
    const playerName = playerInfo.name || 'Desconocido';
    const playerLevel = playerInfo.expLevel || 'N/A';
    const playerDecks = playerInfo.currentDeck || [];
    const playerCards = playerInfo.cards || [];

    let message = `👤 **${playerName}** - Nivel ${playerLevel}\n\n🃏 **Mazo actual:**\n`;
    playerDecks.forEach((card) => {
        message += `- ${card.name} (Nivel ${card.level})\n`;
    });

    message += '\n📋 **Todas las cartas disponibles:**\n';
    playerCards.forEach((card) => {
        message += `- ${card.name} (Nivel ${card.level})\n`;
    });

    return message;
};

// Función para generar una imagen con la información del jugador
const generatePlayerImage = async (playerInfo) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const htmlContent = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; background: #1e1e2e; color: white; padding: 20px; }
            h1, h2 { margin: 0; padding: 5px; }
            ul { list-style: none; padding: 0; }
            li { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>Jugador: ${playerInfo.name}</h1>
          <h2>Nivel: ${playerInfo.expLevel}</h2>
          <h3>Mazo Actual</h3>
          <ul>
            ${playerInfo.currentDeck.map(card => `<li>${card.name} (Nivel ${card.level})</li>`).join('')}
          </ul>
          <h3>Todas las Cartas</h3>
          <ul>
            ${playerInfo.cards.map(card => `<li>${card.name} (Nivel ${card.level})</li>`).join('')}
          </ul>
        </body>
        </html>
    `;

    await page.setContent(htmlContent);
    const screenshotBuffer = await page.screenshot({ fullPage: true });

    await browser.close();
    return screenshotBuffer;
};

// Manejo de errores
const handleError = (error, conn, m) => {
    if (error.response && error.response.status === 404) {
        conn.reply(
            m.chat,
            '_El código de jugador no es válido o el jugador no existe._',
            m
        );
    } else {
        console.error('Error al buscar la información del jugador:', error);
        conn.reply(
            m.chat,
            '_Ha ocurrido un error al buscar la información del jugador._',
            m
        );
    }
};

// Definición del comando
handler.command = /^(\.CRJ|jcr|playerc royal) (\d{4,})$/i;

export default handler;