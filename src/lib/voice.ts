import { createReadStream, createWriteStream } from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import { Telegraf } from 'telegraf'
import { OpenAIApi } from 'openai'
import axios from 'axios'

export async function downloadVoiceFile(
  workDir: string,
  fileId: string,
  bot: Telegraf
) {
  const oggDestination = `${workDir}/${fileId}.ogg`
  const wavDestination = `${workDir}/${fileId}.mp3`
  const fileLink = await bot.telegram.getFileLink(fileId)

  const writestream = createWriteStream(oggDestination)
  const response = await axios({
    method: 'GET',
    url: fileLink.toString(),
    responseType: 'stream',
  })

  await new Promise((resolve, reject) => {
    response.data.pipe(writestream)
    writestream.on('finish', resolve)
    writestream.on('error', reject)
  })

  await new Promise((resolve, reject) => {
    ffmpeg(oggDestination)
      .format('mp3')
      .on('error', reject)
      .on('end', resolve)
      .save(wavDestination)
  })

  return wavDestination
}

export async function postToWhisper(openai: OpenAIApi, audioFilePath: string) {
  const transcript = await openai.createTranscription(
    createReadStream(audioFilePath) as any,
    'whisper-1'
  )
  return transcript.data.text
}
