const ffmpeg = require('fluent-ffmpeg');
const { Readable } = require('stream');

function GIFBufferToVideoBuffer(gifBuffer) {
  return new Promise((resolve, reject) => {
    const inputStream = new Readable();
    inputStream._read = () => {};
    inputStream.push(gifBuffer);
    inputStream.push(null);

    const chunks = [];
    const ffmpegProcess = ffmpeg(inputStream)
      .inputFormat('gif')
      .toFormat('mp4')
      .outputOptions([
        '-movflags frag_keyframe+empty_moov',
        '-preset veryfast',
        '-pix_fmt yuv420p'
      ])
      .on('error', reject)
      .on('end', () => resolve(Buffer.concat(chunks)))
      .pipe();

    ffmpegProcess.on('data', (chunk) => chunks.push(chunk));
  });
}

module.exports = GIFBufferToVideoBuffer;