const handler = async (m, { conn }) => {
  try {
    const sender = m.sender || '0@s.whatsapp.net'
    const senderTag = '@' + sender.split('@')[0]

    // Detectar si hay alguien mencionado o mensaje citado
    const mentioned = m.mentionedJid?.[0]
    const quoted = m.quoted?.sender
    const target = mentioned || quoted || null
    const targetTag = target ? '@' + target.split('@')[0] : '¡alguien!'

    const texto = `🤗 ${senderTag} le dio un gran abrazo a ${targetTag}`

    const gifs = [
      'https://media.giphy.com/media/l2QDM9Jnim1YVILXa/giphy.gif',
      'https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif',
      'https://media.giphy.com/media/xT39CXg70nNS0MFNLy/giphy.gif',
      'https://media.giphy.com/media/BXrwTdoho6hkQ/giphy.gif'
    ]

    const gif = gifs[Math.floor(Math.random() * gifs.length)]

    // Solo incluir menciones si existen
    const menciones = []
    if (sender) menciones.push(sender)
    if (target) menciones.push(target)

    await conn.sendMessage(m.chat, {
      video: { url: gif },
      gifPlayback: true,
      caption: texto,
      mentions: menciones
    })
  } catch (err) {
    console.error('Error en .abrazar:', err)
    await conn.sendMessage(m.chat, {
      text: '⚠️ Hubo un error al enviar el abrazo. Intenta de nuevo más tarde.'
    })
  }
}

handler.command = ['abrazar']
handler.tags = ['expresion']
handler.help = ['abrazar @usuario']
handler.register = true

module.exports = handler