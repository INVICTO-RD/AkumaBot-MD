// Plugin de insultos automáticos para GataBot-MD: responde solo a .alex (pegado o separado) y los insultos/respuestas son en español, el código está en inglés.

// ---- Insultos cortos ----
const shortInsults = [
  "Tonto.", "Idiota.", "Inútil.", "Patético.", "Ridículo.", "Simplón.", "Torpe.", "Pesado.", "Feo.", "Triste.",
  "Molesto.", "Fracasado.", "Desperdicio.", "Nulo.", "Insuficiente.", "Vago.", "Negligente.", "Desastroso.",
  "Mediocre.", "Invisible.", "Insoportable.", "Irrelevante.", "Plano.", "Cliché.", "Muermo.", "Pálido.",
  "Torcido.", "Cansino.", "Rancio.", "Seco.", "Lento.", "Bobo.", "Insufrible.", "Plomizo.", "Soso.",
  "Agotado.", "Pesimista.", "Sombrío.", "Banal.", "Cenizo."
];

// ---- Insultos largos ----
const longInsults = [
  "Si la mediocridad tuviera nombre, el tuyo estaría en letras mayúsculas y negritas.",
  "Hablar contigo es como actualizar Windows 98: una pérdida de tiempo garantizada.",
  "Eres como un bug en producción: nadie sabe cómo llegaste aquí, pero todos quieren que te vayas.",
  "Tu presencia en el chat baja el promedio de inteligencia a niveles subterráneos.",
  "Eres el pantallazo azul del grupo: cada vez que apareces, todo se detiene.",
  "Tus argumentos son tan sólidos como una mesa de tres patas en un terremoto.",
  "Si fueras backup, perderías hasta los recuerdos de la infancia.",
  "Eres tan innecesario que ni el universo te tiene en cuenta a la hora de desperdiciar energía.",
  "Tus insultos son tan flojos que hasta el bot siente lástima por ti.",
  "Si fueras spoiler, ni la trama te recordaría.",
  "Eres el ejemplo perfecto de un error no documentado.",
  "Hasta el silencio se aburre cuando hablas.",
  "Eres tan útil como el botón de cerrar en un pop-up falso.",
  "Si fueras playlist, solo tendrías silencios incómodos.",
  "Si fueras app, te desinstalarían nada más instalarte.",
  "Eres el tutorial que nadie lee ni en YouTube.",
  "Tu lógica es un bug sin fix.",
  "Eres como un WiFi sin señal: prometes mucho y no das nada.",
  "Si fueras meme, nadie lo compartiría, ni por lástima.",
  "Tu apoyo es como el modo avión: no llega nunca.",
  "Eres el jefe final de la tristeza, pero ni experiencia das al vencerte.",
  "Ni en tus mejores sueños logras ser relevante.",
  "Eres la notificación de batería baja en reunión importante.",
  "Tu sentido del humor es tan oscuro que da miedo.",
  "Tu optimismo es como el WiFi público: inestable y lento.",
  "Eres el spoiler del grupo: todos quieren saltarte.",
  "Tus aportes son como la letra pequeña: nadie los lee.",
  "Eres el sticker que nunca pega.",
  "Si fueras antivirus, traerías virus.",
  "Eres la excepción que ni el bug quiere capturar.",
  "Eres como un backup corrupto: no sirves ni de recuerdo.",
  "Tus ideas son como los lunes: pesadas y nadie las quiere.",
  "Hasta el silencio te esquiva.",
  "Tu presencia es el anuncio que nadie quiere ver.",
  "Comparado contigo, una piedra tiene más evolución.",
  "Tus logros caben en un post-it, y aún sobra espacio.",
  "Si la irrelevancia tuviera una foto en el diccionario, saldrías tú posando."
];

// ---- Insultos narcisistas ----
const narcissisticInsults = [
  "Agradece que te respondo, es un lujo que no todo el mundo se puede permitir.",
  "No puedes competir conmigo, incluso en mis peores días sigo siendo mejor que tú.",
  "Mi sombra tiene más personalidad y carisma que todo tu árbol genealógico.",
  "Comparado conmigo, eres como un archivo .txt: básico y sin formato.",
  "Mis logros son historias, los tuyos apenas rumores.",
  "Soy la actualización premium, tú eres la demo que nadie descarga.",
  "Tenerme en tu chat es como tener WiFi gratis, pero tú ni sabes conectarte.",
  "Podría insultarte con clase, pero prefiero no rebajarme tanto.",
  "Te respondería a tu altura, pero no sé hacer malabares en el subsuelo.",
  "Sólo mi presencia ya sube el estándar aquí, no te sientas mal por no alcanzarlo.",
  "Me esfuerzo más en ignorarte que tú en ser relevante.",
  "Si la grandeza fuera contagiosa, aún así no te llegaría.",
  "Eres el recordatorio de lo lejos que está la perfección de lo básico.",
  "A mi lado, hasta la inteligencia artificial se siente obsoleta contigo.",
  "Solo yo puedo decir cosas inteligentes aquí, tú solo intentas no hacer el ridículo."
];

// ---- Insultos de humor negro ----
const darkHumorInsults = [
  "Tu futuro es tan brillante como un eclipse a medianoche.",
  "Si fueras luz al final del túnel, seguro que es un tren que viene de frente.",
  "Eres el ejemplo perfecto de por qué la evolución tiene bugs.",
  "Tu nivel es tan bajo que ni el infierno te acepta en la whitelist.",
  "Eres el VHS en la era del streaming.",
  "Si fueras backup, perderías hasta las ganas de existir.",
  "Eres tan gris que hasta las nubes te usan de ejemplo.",
  "Si fueras spoiler, serías la alerta de tsunami en el desierto.",
  "Tu simpatía es la demo: solo dura cinco minutos.",
  "Tus argumentos son el error 404 de la lógica.",
  "Eres la excepción que ni el bug quiere capturar.",
  "Hasta el silencio se aburre contigo.",
  "Eres la notificación que nadie abre.",
  "Si fueras backup, te perderías en la nube.",
  "Si fueras meme, serías el que solo entienden en funerales.",
  "Tus aportes a la conversación son como el oxígeno en el vacío: absolutamente innecesarios."
];

// ---- Insultos absurdos ----
const absurdInsults = [
  "Eres como un paraguas en el desierto: absolutamente fuera de lugar.",
  "Más perdido que WiFi en el Polo Norte.",
  "Si fueras objeto, serías un abrelatas en una tienda de tapitas.",
  "Eres el VHS en la era de Netflix.",
  "Tu lógica es igual a una calculadora sin pilas.",
  "Si fueras sticker, serías el que nunca pega.",
  "Eres el tutorial que nadie lee ni en YouTube.",
  "Eres tan útil como un disquete en 2025.",
  "Si fueras ingrediente, arruinarías la receta hasta de agua.",
  "Eres el modo incógnito de la simpatía: nadie nota que existes.",
  "Tu existencia es el buffering eterno.",
  "Si fueras backup, perderías hasta los datos del calendario lunar.",
  "Eres la pestaña abierta que nadie quiere recordar.",
  "Si fueras playlist, sólo tendrías silencios incómodos.",
  "Eres el captcha imposible de la vida.",
  "Tu presencia es el modo avión del grupo.",
  "Si fueras meme, nadie lo entendería ni con subtítulos.",
  "Eres una calculadora de sol en una mina.",
  "Tu conversación es como un fax en 2025: nadie la recibe."
];

// ---- Insultos generados automáticamente ----
function generateExtraInsults(count) {
  const templates = [
    "Si fueras {object}, ni para adorno servirías.",
    "Tan irrelevante como {uselessThing}.",
    "En el mundo de los {world}, tú serías el {worst}.",
    "Tu {quality} es tan baja como el {lowObject}.",
    "Más rancio que {irrelevantThing}.",
    "Eres el {element} de los {uselessThings}.",
    "Si fueras {technology}, estarías {state}.",
    "Tu humor es tan oscuro que absorbe la luz.",
    "Si fueras backup, perderías hasta los memes.",
    "La ironía es que te crees gracioso.",
    "Hasta el silencio te esquiva.",
    "Serías admin en un grupo de bots.",
    "Eres el bug que ni el QA encuentra.",
    "Si fueras playlist, sólo tendrías anuncios.",
    "Eres el recordatorio de lo lejos que está el estándar.",
    "Tu lógica es un bug sin fix.",
    "Si fueras antivirus, traerías virus.",
    "Eres la notificación que ni el spam quiere.",
    "Hasta el bot se aburre de responderte.",
    "Serías el jefe final del tutorial de la vida.",
    "Tienes menos chispa que una piedra mojada.",
    "Tu existencia es un error de compilación.",
    "Tus aportes sólo suman para restar.",
    "Hasta la inteligencia artificial siente vergüenza ajena contigo.",
    "El universo gasta energía en ti solo por error.",
    "Tu presencia baja la media de inteligencia de cualquier sala.",
    "Ni para meme de mal gusto sirves.",
    "Si fueras spoiler, arruinarías hasta tus propios insultos.",
    "Si fueras noticia, serías fake antes de publicarte.",
    "Tu energía es como el WiFi del vecino: sólo molesta.",
    "Si fueras ingrediente, arruinarías la receta hasta de agua.",
    "Eres la notificación que nadie abre.",
    "Tu voz aburre hasta al eco.",
    "Si fueras noticia, serías la que nadie comparte.",
    "Si fueras backup, ni tú te recuperarías.",
    "Eres el sticker que nunca pega.",
    "Si fueras playlist, serías puro silencio.",
    "Tu conversación es el modo avión del grupo."
  ];
  const uselessThings = [
    "un paraguas en el desierto", "un cenicero en una moto", "una cuchara en una caja de herramientas", "un bolígrafo sin tinta",
    "una puerta giratoria en una casa de caracoles", "calefacción en el infierno", "ventilador en la Antártida"
  ];
  const worlds = ["robots", "humanos", "plantas", "apps", "memes", "errores", "conectores USB", "bots", "inteligencias artificiales"];
  const worsts = ["bug", "virus", "fallo", "glitch", "pantallazo azul", "spam", "lag", "cuelgue", "crash"];
  const technologies = ["app", "sistema operativo", "antivirus", "bot", "router", "backup", "Java", "Windows XP"];
  const states = ["desinstalado", "infectado", "actualizado al revés", "en modo seguro", "colgado", "sin soporte", "en beta eterna", "en pantalla azul"];
  const qualities = ["autoestima", "inteligencia", "paciencia", "humildad", "empatía", "originalidad", "sentido común", "carisma", "dignidad"];
  const lowObjects = ["subsuelo", "fondo del mar", "cueva sin fondo", "pozo petrolero", "mínimo histórico", "base de la pirámide alimenticia"];
  const irrelevantThings = [
    "el historial de un router público", "un fax en 2025", "el manual de una tostadora", "los martes a las 3 am", "la letra pequeña de un contrato", "el recibo de la luz de un ermitaño"
  ];
  const elements = ["rey", "jefe", "emperador", "dios", "sultán", "monarca", "zar"];
  const things = ["cosas", "cosas inútiles", "errores", "fracasos", "fallos", "desperdicios", "cosas olvidadas"];
  const objects = ["adorno", "piedra", "pegatina", "chiste", "memoria USB de 128kb", "manual de instrucciones de piedra"];
  const extras = [];
  for (let i = 0; i < count; i++) {
    let template = templates[Math.floor(Math.random() * templates.length)];
    template = template
      .replace(/{object}/g, objects[Math.floor(Math.random() * objects.length)])
      .replace(/{uselessThing}/g, uselessThings[Math.floor(Math.random() * uselessThings.length)])
      .replace(/{world}/g, worlds[Math.floor(Math.random() * worlds.length)])
      .replace(/{worst}/g, worsts[Math.floor(Math.random() * worsts.length)])
      .replace(/{technology}/g, technologies[Math.floor(Math.random() * technologies.length)])
      .replace(/{state}/g, states[Math.floor(Math.random() * states.length)])
      .replace(/{quality}/g, qualities[Math.floor(Math.random() * qualities.length)])
      .replace(/{lowObject}/g, lowObjects[Math.floor(Math.random() * lowObjects.length)])
      .replace(/{irrelevantThing}/g, irrelevantThings[Math.floor(Math.random() * irrelevantThings.length)])
      .replace(/{element}/g, elements[Math.floor(Math.random() * elements.length)])
      .replace(/{uselessThings}/g, things[Math.floor(Math.random() * things.length)]);
    extras.push(template);
  }
  return extras;
}

// Junta todos los insultos en un solo array
const allInsults = [
  ...shortInsults,
  ...longInsults,
  ...narcissisticInsults,
  ...darkHumorInsults,
  ...absurdInsults,
  ...generateExtraInsults(700),
];

// Busca insulto similar
function closestInsult(message) {
  message = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const insult of allInsults) {
    if (insult.toLowerCase().includes(message) && message.length > 2) {
      return insult;
    }
  }
  for (const word of message.split(/\s+/)) {
    if (word.length > 2) {
      for (const insult of allInsults) {
        if (insult.toLowerCase().includes(word)) {
          return insult;
        }
      }
    }
  }
  return null;
}

// Devuelve insulto aleatorio
function randomInsult() {
  return allInsults[Math.floor(Math.random() * allInsults.length)];
}

// Detecta solo .alex pegado o separado
function prefixDetected(text) {
  if (!text) return false
  text = text.trim().toLowerCase()
  return text.startsWith('.alex')
}

// Handler principal: si el mensaje empieza con .alex, responde con insulto en español
let handler = async (m) => {
  if (!m.text || !prefixDetected(m.text)) return
  let input = m.text.replace(/^\. *alex/i, '').trim()
  let reply = closestInsult(input)
  if (!reply) reply = randomInsult()
  if (Math.random() > 0.85) reply += ' ' + randomInsult()
  m.reply(reply)
}

handler.help = ['.alex [texto]']
handler.tags = ['fun', 'insulto']
handler.command = () => false

export default handler