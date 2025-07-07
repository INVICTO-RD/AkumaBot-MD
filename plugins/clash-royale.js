
import axios from "axios";

const cardTranslations = {
    "Knight": "Caballero",
    "Archers": "Arqueras",
    "Giant": "Gigante",
    "Musketeer": "Mosquetera",
    "Baby Dragon": "Dragón Bebé",
    "Mini P.E.K.K.A": "Mini P.E.K.K.A",
    "Valkyrie": "Valquiria",
    "Hog Rider": "Montapuercos",
    "Wizard": "Mago",
    "Prince": "Príncipe",
    "Skeletons": "Esqueletos",
    "Bomber": "Bombardero",
    "Fireball": "Bola de Fuego",
    "Arrows": "Flechas",
    "Zap": "Descarga",
    "Goblin Barrel": "Barril de Duendes",
    "Inferno Tower": "Torre Infernal",
    "Balloon": "Globo",
    "Witch": "Bruja",
    "Cannon": "Cañón",
    "Barbarians": "Bárbaros",
    "Rocket": "Cohete",
    "Tombstone": "Lápida",
    "Bomb Tower": "Torre Bomba",
    "Minions": "Esbirros",
    "Horde of Minions": "Horda de Esbirros",
    "Battle Ram": "Ariete de Batalla",
    "Lumberjack": "Leñador",
    "Graveyard": "Cementerio",
    "Electro Wizard": "Mago Eléctrico",
    "Royal Giant": "Gigante Noble",
    "Mega Minion": "Mega Esbirro",
    "Ice Spirit": "Espíritu de Hielo",
    "Ice Wizard": "Mago de Hielo",
    "Goblin Gang": "Pandilla de Duendes",
    "Dark Prince": "Príncipe Oscuro",
    "Three Musketeers": "Tres Mosqueteras",
    "Sparky": "Chispitas",
    "Miner": "Minero",
    "Bandit": "Bandida",
    "Royal Ghost": "Fantasma Real",
    "Zappies": "Electrocutadores",
    "Magic Archer": "Arquero Mágico",
    "Electro Dragon": "Dragón Eléctrico",
    "Fisherman": "Pescador",
    "Goblin Cage": "Jaula de Duendes",
    "Earthquake": "Terremoto",
    "Elixir Golem": "Gólem de Elixir",
    "Battle Healer": "Sanadora de Batalla",
    "Firecracker": "Lanza Fuegos",
    "Royal Delivery": "Entrega Real",
    "Skeleton Dragons": "Dragones Esqueléticos",
    "Mother Witch": "Bruja Madre",
    "Electro Spirit": "Espíritu Eléctrico",
    "Cannon Cart": "Carro de Cañón",
    "Giant Skeleton": "Esqueleto Gigante",
    "Goblin Drill": "Taladro de Duendes",
    "Monk": "Monje",
    "Phoenix": "Fénix",
    "Skeleton King": "Rey Esqueleto",
    "Archer Queen": "Reina Arquera",
    "Golden Knight": "Caballero Dorado",
    "bats": "Murcielagos",
    "Mega Knight": "Mega Caballero"
};

let handler = async (m, { args }) => {
    if (!args[0]) throw "*Por favor proporciona un ID válido de jugador de Clash Royale. Ejemplo: .CRJ #RG28C20JV*";

    let playerId = args[0].toUpperCase();
    if (!playerId.startsWith("#")) playerId = `#${playerId}`;

    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjM5MjJjMzY5LWM5MjMtNGQ3My1hN2JlLWNlMzAyYmRjOGY0NyIsImlhdCI6MTc0NDMzNDI3Mywic3ViIjoiZGV2ZWxvcGVyLzRlMzE1MDg4LWJjZDUt ZTU3MS0yNWQxLTRiYjc2NTg4MGNlNCIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyI0NS43OS4yMTguNzkiXSwidHlwZSI6ImNsaWVudCJ9XX0.jp3UmGkOmtcO60M5x2FYmz5xRiX36zLKc7qiU0mNGS2APQQMoXxyL75yoYuT0e0y6qe65-FdCQ2f1g2V41yexQ"; // Reemplaza con tu token real desde Clash Royale Developer Portal
    const apiUrl = `https://proxy.royaleapi.dev/v1/players/${encodeURIComponent(playerId)}`;

    try {
        const response = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const playerInfo = response.data;

        // Verificar correctamente los niveles de las cartas
        const deckInfo = playerInfo.currentDeck.map((card, index) => {
            const translatedName = cardTranslations[card.name] || card.name;
            const correctLevel = card.level + (14 - card.maxLevel); // Ajuste para calcular correctamente el nivel de la carta
            return `${index + 1}. ${translatedName} (Nivel ${correctLevel})`;
        }).join("\n");

        // Obtener nombre y nivel de la arena
        const arenaName = playerInfo.arena?.name || "Desconocida";
        const arenaLevel = playerInfo.arena?.arena || "Desconocido"; // El campo `arena` contiene el nivel de la arena

        const message = `
👤 **Nombre del Jugador:** ${playerInfo.name}
🏅 **Nivel del Jugador:** ${playerInfo.expLevel}
🏟️ **Arena Actual:** ${arenaName} (Nivel ${arenaLevel})

🃏 **Mazos Actuales:**
${deckInfo}
        `;

        m.reply(message.trim());
    } catch (error) {
        if (error.response && error.response.status === 403) {
            m.reply("*No se pudo autenticar con la API de Clash Royale. Por favor, verifica el token.*");
        } else if (error.response && error.response.status === 404) {
            m.reply("*El ID ingresado no existe en Clash Royale. Verifica y prueba de nuevo.*");
        } else {
            console.error("Error al buscar la información del jugador:", error);
            m.reply("*Ha ocurrido un error al obtener la información del jugador. Intenta más tarde.*");
        }
    }
};

handler.help = ['crj *<ID del jugador>*'];
handler.tags = ['games'];
handler.command = ['crj', 'clashroyale', 'royale'];
handler.register = true;

export default handler;