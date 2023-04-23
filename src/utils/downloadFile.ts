import { Telegraf } from "telegraf"
import { createWriteStream } from 'fs'
import axios from 'axios'

export async function downloadFile(
  workDir: string,
  fileId: string,
  ext: string,
  bot: Telegraf
) {
  const destination = `${workDir}/${fileId}.${ext}`
  const fileUrl = await bot.telegram.getFileLink(fileId)

  const writestream = createWriteStream(destination)
  const response = await axios({
    method: 'GET',
    url: fileUrl.toString(),
    responseType: 'stream',
  })

  await new Promise((resolve, reject) => {
    response.data.pipe(writestream)
    writestream.on('finish', resolve)
    writestream.on('error', reject)
  })

  return destination
}
