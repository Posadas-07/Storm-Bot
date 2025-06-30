const handler = async (msg, { conn }) => {
  try {
    // Obtener ID del remitente
    const senderId = msg.sender || msg.key?.participant || msg.key?.remoteJid || '0@s.whatsapp.net'
    const sender = '@' + senderId.split('@')[0]

    // Obtener objetivo del abrazo
    const mentionedJid = (msg.mentionedJid && msg.mentionedJid[0]) || null
    const quotedJid = (msg.quoted && msg.quoted.sender) || null
    const target = mentionedJid || quotedJid || null

    const receiver = target ? '@' + target.split('@')[0] : '¡alguien!'
    const texto = `🤗 ${sender} le dio un gran abrazo a ${receiver}`

    // Lista de GIFs
    const gifs = [
      'https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif',
      'https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif',
      'https://media.giphy.com/media/xT39CXg70nNS0MFNLy/giphy.gif',
      'https://media.giphy.com/media/BXrwTdoho6hkQ/giphy.gif'
    ]
    const gif = gifs[Math.floor(Math.random() * gifs.length)]

    // Solo añadir menciones si existen
    const menciones = [senderId]
    if (target) menciones.push(target)

    await conn.sendMessage(msg.chat, {
      video: { url: gif },
      gifPlayback: true,
      caption: texto,
      mentions: menciones
    })

  } catch (e) {
    console.error('Error en el comando abrazar:', e)
    await conn.sendMessage(msg.chat, { text: '⚠️ Ocurrió un error al intentar abrazar. Intenta de nuevo.' })
  }
}

handler.command = ['abrazar']
handler.tags = ['expresion']
handler.help = ['abrazar @usuario']
handler.register = true

module.exports = handler