const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { promisify } = require("util");
const { pipeline } = require("stream");
const streamPipe = promisify(pipeline);

// Almacena tareas pendientes por previewMessageId
const pending = {};

// Cooldown por usuario (2 minutos)
const COOLDOWN_FILE = path.join(__dirname, "../cooldowns.json");
const COOLDOWN_TIME = 2 * 60 * 1000; // 2 minutos

if (!fs.existsSync(COOLDOWN_FILE)) fs.writeFileSync(COOLDOWN_FILE, "{}");

module.exports = async (msg, { conn, text }) => {
  const subID = (conn.user.id || "").split(":")[0] + "@s.whatsapp.net";
  const pref = (() => {
    try {
      const p = JSON.parse(fs.readFileSync("prefixes.json", "utf8"));
      return p[subID] || ".";
    } catch {
      return ".";
    }
  })();

  // Cooldown per user
  let cooldowns = JSON.parse(fs.readFileSync(COOLDOWN_FILE));
  const senderID = (msg.key.participant || msg.key.remoteJid).split("@")[0];
  const now = Date.now();

  if (cooldowns[senderID] && now - cooldowns[senderID] < COOLDOWN_TIME) {
    const remaining = Math.ceil((COOLDOWN_TIME - (now - cooldowns[senderID])) / 1000);
    return conn.sendMessage(msg.key.remoteJid, {
      text: `⏱️ Espera *${remaining} segundos* antes de volver a usar este comando.`,
      mentions: [msg.key.participant]
    }, { quoted: msg });
  }

  cooldowns[senderID] = now;
  fs.writeFileSync(COOLDOWN_FILE, JSON.stringify(cooldowns, null, 2));

  if (!text) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: `✳️ Usa:\n${pref}playpro <término>\nEj: *${pref}playpro* bad bunny diles` },
      { quoted: msg }
    );
  }

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "⏳", key: msg.key }
  });

  const res = await yts(text);
  const video = res.videos[0];
  if (!video) {
    return conn.sendMessage(
      msg.key.remoteJid,
      { text: "❌ Sin resultados." },
      { quoted: msg }
    );
  }

  const { url: videoUrl, title, timestamp: duration, views, author } = video;
  const viewsFmt = views.toLocaleString();

  const caption = `
╔═══════════════╗
║✦ STORM 2.0 BOT✦
╚═══════════════╝
📀 Info del video:
╭───────────────╮
├ 🎼 Título: ${title}
├ ⏱️ Duración: ${duration}
├ 👁️ Vistas: ${viewsFmt}
├ 👤 Autor: ${author}
└ 🔗 Link: ${videoUrl}
╰───────────────╯
📥 Opciones de Descarga reacione o responda el mensaje del bot🎮:
┣ 👍 Audio MP3     (1 / audio)
┣ ❤️ Video MP4     (2 / video)
┣ 📄 Audio Doc     (4 / audiodoc)
┗ 📁 Video Doc     (3 / videodoc)

📦 Si usas termux o no estás en Sky Ultra Plus:
┣ 🎵 ${pref}play5 ${text}
┣ 🎥 ${pref}play6 ${text}
┗ ⚠️ ${pref}ff
═════════════════════
   𖥔 Azura Ultra 2.0 Bot 𖥔
═════════════════════`.trim();

  const preview = await conn.sendMessage(
    msg.key.remoteJid,
    { image: { url: video.thumbnail }, caption },
    { quoted: msg }
  );

  pending[preview.key.id] = {
    chatId: msg.key.remoteJid,
    videoUrl,
    title,
    commandMsg: msg,
    done: { audio: false, video: false, audioDoc: false, videoDoc: false }
  };

  await conn.sendMessage(msg.key.remoteJid, {
    react: { text: "✅", key: msg.key }
  });

  if (!conn._playproListener) {
    conn._playproListener = true;
    conn.ev.on("messages.upsert", async ev => {
      for (const m of ev.messages) {
        if (m.message?.reactionMessage) {
          const { key: reactKey, text: emoji } = m.message.reactionMessage;
          const job = pending[reactKey.id];
          if (job) {
            await handleDownload(conn, job, emoji, job.commandMsg);
          }
        }

        try {
          const context = m.message?.extendedTextMessage?.contextInfo;
          const citado = context?.stanzaId;
          const texto = (
            m.message?.conversation?.toLowerCase() ||
            m.message?.extendedTextMessage?.text?.toLowerCase() ||
            ""
          ).trim();
          const job = pending[citado];
          const chatId = m.key.remoteJid;
          if (citado && job) {
            if (["1", "audio", "4", "audiodoc"].includes(texto)) {
              const docMode = ["4", "audiodoc"].includes(texto);
              await conn.sendMessage(chatId, { react: { text: docMode ? "📄" : "🎵", key: m.key } });
              await conn.sendMessage(chatId, { text: `🎶 Descargando audio...` }, { quoted: m });
              await downloadAudio(conn, job, docMode, m);
            } else if (["2", "video", "3", "videodoc"].includes(texto)) {
              const docMode = ["3", "videodoc"].includes(texto);
              await conn.sendMessage(chatId, { react: { text: docMode ? "📁" : "🎬", key: m.key } });
              await conn.sendMessage(chatId, { text: `🎥 Descargando video...` }, { quoted: m });
              await downloadVideo(conn, job, docMode, m);
            } else {
              await conn.sendMessage(chatId, {
                text: `⚠️ Opciones válidas:\n1/audio, 4/audiodoc → audio\n2/video, 3/videodoc → video`
              }, { quoted: m });
            }

            if (!job._timer) {
              job._timer = setTimeout(() => delete pending[citado], 5 * 60 * 1000);
            }
          }
        } catch (e) {
          console.error("Error en detector citado:", e);
        }
      }
    });
  }
};

async function handleDownload(conn, job, choice, quotedMsg) {
  const mapping = {
    "👍": "audio",
    "❤️": "video",
    "📄": "audioDoc",
    "📁": "videoDoc"
  };
  const key = mapping[choice];
  if (key) {
    const isDoc = key.endsWith("Doc");
    await conn.sendMessage(job.chatId, { text: `⏳ Descargando ${isDoc ? "documento" : key}…` }, { quoted: job.commandMsg });
    if (key.startsWith("audio")) await downloadAudio(conn, job, isDoc, job.commandMsg);
    else await downloadVideo(conn, job, isDoc, job.commandMsg);
  }
}

async function downloadAudio(conn, job, asDocument, quoted) {
  const { chatId, videoUrl, title } = job;
  const api = `https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=audio&quality=128kbps&apikey=russellxz`;
  const res = await axios.get(api);
  if (!res.data?.status || !res.data.data?.url) throw new Error("No se pudo obtener el audio");
  const tmp = path.join(__dirname, "../tmp");
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
  const inFile = path.join(tmp, `${Date.now()}_in.m4a`);
  const outFile = path.join(tmp, `${Date.now()}_out.mp3`);
  const download = await axios.get(res.data.data.url, { responseType: "stream" });
  await streamPipe(download.data, fs.createWriteStream(inFile));
  await new Promise((r, e) => ffmpeg(inFile).audioCodec("libmp3lame").audioBitrate("128k").format("mp3").save(outFile).on("end", r).on("error", e));
  const buffer = fs.readFileSync(outFile);
  await conn.sendMessage(chatId, {
    [asDocument ? "document" : "audio"]: buffer,
    mimetype: "audio/mpeg",
    fileName: `${title}.mp3`
  }, { quoted });
  fs.unlinkSync(inFile);
  fs.unlinkSync(outFile);
}

async function downloadVideo(conn, job, asDocument, quoted) {
  const { chatId, videoUrl, title } = job;
  const qualities = ["720p","480p","360p"];
  let url = null;
  for (let q of qualities) {
    try {
      const r = await axios.get(`https://api.neoxr.eu/api/youtube?url=${encodeURIComponent(videoUrl)}&type=video&quality=${q}&apikey=russellxz`);
      if (r.data?.status && r.data.data?.url) { url = r.data.data.url; break; }
    } catch {}
  }
  if (!url) throw new Error("No se pudo obtener el video");
  const tmp = path.join(__dirname, "../tmp");
  if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
  const file = path.join(tmp, `${Date.now()}_vid.mp4`);
  const dl = await axios.get(url, { responseType: "stream" });
  await streamPipe(dl.data, fs.createWriteStream(file));
  await conn.sendMessage(chatId, {
    [asDocument ? "document" : "video"]: fs.readFileSync(file),
    mimetype: "video/mp4",
    fileName: `${title}.mp4`,
    caption: asDocument ? undefined : `🎬 Aquí tiene su video.\n© Azura Ultra`
  }, { quoted });
  fs.unlinkSync(file);
}

module.exports.command = ["play"];