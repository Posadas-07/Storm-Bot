const handler = async (msg, { conn, args }) => { const chatId = msg.key.remoteJid; const sender = msg.key.participant || msg.key.remoteJid; const senderNum = sender.replace(/[^0-9]/g, ""); const isOwner = global.owner.some(([id]) => id === senderNum); const isFromMe = msg.key.fromMe;

if (!chatId.endsWith("@g.us")) { return conn.sendMessage(chatId, { text: "❌ Este comando solo puede usarse en grupos." }, { quoted: msg }); }

const meta = await conn.groupMetadata(chatId); const isAdmin = meta.participants.find(p => p.id === sender)?.admin;

if (!isAdmin && !isOwner && !isFromMe) { return conn.sendMessage(chatId, { text: "❌ Solo admins o el dueño del bot pueden usar este comando." }, { quoted: msg }); }

// Obtener JID de la víctima let mentionedJid = msg.mentionedJid && msg.mentionedJid[0] ? msg.mentionedJid[0] : args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : sender;

const nombreVictima = '@' + mentionedJid.split('@')[0];

const fases = [ *[ 👾 INICIANDO ATAQUE A ${nombreVictima}... ]*, '[ ☠️ CONECTANDO A SERVIDOR DE WHATSAPP... ]', '[ 🔓 DESCIFRANDO CLAVES ENCRIPTADAS... ]', '[ 👁️‍🗨️ INTERCEPTANDO MENSAJES PRIVADOS... ]', '[ 💾 CLONANDO WHATSAPP EN LA NUBE... ]', '[ ⚠️ PROGRESO: 10% ▓░░░░░░░░░░ ]', '[ ⚠️ PROGRESO: 30% ▓▓▓░░░░░░░░ ]', '[ ⚠️ PROGRESO: 50% ▓▓▓▓▓░░░░░░ ]', '[ ⚠️ PROGRESO: 70% ▓▓▓▓▓▓▓░░░░ ]', '[ ⚠️ PROGRESO: 90% ▓▓▓▓▓▓▓▓▓░░ ]', '[ ✅ ATAQUE COMPLETO: 100% ▓▓▓▓▓▓▓▓▓▓ ]', *[ 🎉 SE HA ACCEDIDO A WHATSAPP DE ${nombreVictima}... ERA BROMA 💀]* ];

const tempMsg = await conn.sendMessage(chatId, { text: fases[0], mentions: [mentionedJid] }, { quoted: msg });

for (let i = 1; i < fases.length; i++) { await new Promise(r => setTimeout(r, 1500)); await conn.sendMessage(chatId, { edit: tempMsg.key, text: fases[i], mentions: [mentionedJid] }); } };

handler.command = ['asustar']; module.exports = handler;

