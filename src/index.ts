import dotenv from 'dotenv'
dotenv.config()
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import log from './utils/log'
import { Agent } from './agent'
import { existsSync, mkdirSync } from 'fs'
import { downloadVoiceFile, postToWhisper } from './lib/voice'
import { summarize } from './summarize'
import { requestContext, sendCostInfo } from './lib/request'
import { Configuration, OpenAIApi } from "openai"


if (!process.env.TELEGRAM_TOKEN) {
  log('fatal', 'Missing environment variable TELEGRAM_TOKEN.')
  process.exit()
}

const workDir = './tmp'
if (!existsSync(workDir)) {
  mkdirSync(workDir)
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)
const helpMessage = 'I\'m a GPT-3.5 language model. I can google and I understand voice messages. Ask me anything, or send a file to summarize'


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
    const params = requestContext()
    const openai = new OpenAIApi(new Configuration({ apiKey: params.openAIApiKey }))
    const response = await openai.createImage({ prompt })
    response.data.data.forEach(data => ctx.replyWithPhoto({ url: data.url! }))
    log('debug', response.data)
    await sendCostInfo(ctx, { model: 'image', count: response.data.data.length })
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
    const params = requestContext()
    const agent = new Agent(params)
    const response = await agent.call(text)
    await ctx.reply(response)
    await sendCostInfo(ctx, { model: agent.model.modelName as any, count: (params.callbackManager.handlers[0] as any).totalTokens })
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

  const params = requestContext()
  const openai = new OpenAIApi(new Configuration({ apiKey: params.openAIApiKey }))
  const transcription = await postToWhisper(openai, localFilePath)
  log('debug', 'Received transcript:', transcription)
  await ctx.reply(`Transcription: ${transcription}`)
  await ctx.sendChatAction('typing')

  const agent = new Agent(params)
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
  await sendCostInfo(ctx, { model: agent.model.modelName as any, count: (params.callbackManager.handlers[0] as any).totalTokens })
})

bot.on(message('document'), async (ctx) => {
  await ctx.reply('Summarizing document...')
  await ctx.sendChatAction('typing')
  try {
    const params = requestContext()
    const summary = await summarize(ctx.update.message.document.file_id, workDir, bot, params)
    await ctx.reply(summary.toString())
    await sendCostInfo(ctx, { model: 'gpt-3.5-turbo', count: (params.callbackManager.handlers[0] as any).totalTokens })
  } catch (error: any) {
    log('error', error)
    const message = JSON.stringify(error?.response?.data?.error ?? error?.message, null, 2)
    await ctx.reply(`There was an error while generating summary.\n\n<pre>${message}</pre>`, { parse_mode: 'HTML' })
  }
})

bot.launch()
log('info', "🚀 Bot launched")

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
