import fetch from 'node-fetch';

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('🌸 *Ingresa un texto para hablar con la Bot*');

    try {
        let api = await fetch(`https://deliriussapi-oficial.vercel.app/ia/chatgpt?q=${encodeURIComponent(text)}`);
        let responseText = await api.text(); // Obtén la respuesta como texto

        // Intenta parsear la respuesta como JSON
        try {
            let json = JSON.parse(responseText);

            if (json.data) {
                m.reply(json.data); // Respuesta válida de la API
            } else {
                m.reply('🌸 *No se recibió una respuesta válida de la IA.*');
            }
        } catch (jsonError) {
            // La respuesta no es un JSON válido
            m.reply(`🌸 *Error en la respuesta de la API:* ${responseText}`);
            console.error('Error al parsear JSON:', jsonError);
        }
    } catch (fetchError) {
        m.reply('🌸 *Hubo un error al comunicarse con la IA. Intenta de nuevo más tarde.*');
        console.error('Error al realizar fetch:', fetchError);
    }
};

handler.command = ['ia', 'chatgpt'];

export default handler; // Asegúrate de que no haya una llave extra después de esta línea