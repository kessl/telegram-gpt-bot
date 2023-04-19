import dotenv from 'dotenv'
dotenv.config()
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import log from './utils/log'
import { Agent } from './agent'
import { existsSync, mkdirSync } from 'fs'
import { downloadVoiceFile, postToWhisper } from './lib/voice'


if (!process.env.TELEGRAM_TOKEN) {
  log('fatal', 'Missing environment variable TELEGRAM_TOKEN.')
  process.exit()
}

const workDir = './tmp'
if (!existsSync(workDir)) {
  mkdirSync(workDir)
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)
const agent = new Agent()
const helpMessage = 'I\'m a GPT-3.5 language model. I can google and I understand voice messages. Ask me anything'

bot.start(ctx => {
  ctx.reply(`GREETINGS FELLOW HUMAN\n\n${helpMessage}`)
})

bot.help(ctx => {
  ctx.reply(helpMessage)
})

bot.command('image', async ctx => {
  const prompt = ctx.message.text.replace('/image', '')
  await ctx.sendChatAction('typing')
  try {
    const response = await agent.openai.createImage({ prompt })
    response.data.data.forEach(data => ctx.replyWithPhoto({ url: data.url! }))
    log('debug', response.data)
  } catch (error: any) {
    log('error', error)
    const message = JSON.stringify(error?.response?.data?.error ?? error?.message, null, 2)
    await ctx.reply(`There was an error generating image.\n\n<pre>${message}</pre>`, { parse_mode: 'HTML' })
  }
})

bot.on(message('text'), async ctx => {
  const text = ctx.message.text
  log('debug', 'Received:', text)
  await ctx.sendChatAction('typing')

  try {
    const response = await agent.call(text)
    await ctx.reply(response)
  } catch (error: any) {
    log('error', error)
    const message = JSON.stringify(error?.response?.data?.error ?? error?.message, null, 2)
    await ctx.reply(`There was an error while processing your message.\n\n<pre>${message}</pre>`, { parse_mode: 'HTML' })
  }
})

bot.on(message('voice'), async ctx => {
  const voice = ctx.message.voice
  await ctx.sendChatAction('typing')

  let localFilePath
  try {
    localFilePath = await downloadVoiceFile(workDir, voice.file_id, bot)
    log('debug', 'audio file path', localFilePath)
  } catch (error) {
    log('error', error)
    await ctx.reply('There was an error while downloading the voice file. Maybe ffmpeg is not installed?')
    return
  }

  const transcription = await postToWhisper(agent.openai, localFilePath)
  log('debug', 'Received transcript:', transcription)
  await ctx.reply(`Transcription: ${transcription}`)
  await ctx.sendChatAction('typing')

  let response
  try {
    response = await agent.call(transcription)
  } catch (error) {
    log('error', error)
    await ctx.reply('Whoops! There was an error while talking to OpenAI. See logs for details.')
    return
  }

  log('debug', response)
  await ctx.reply(response)
})

bot.launch()
log('info', "🚀 Bot launched")

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
