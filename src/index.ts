import dotenv from 'dotenv'
dotenv.config()
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import log from './utils/log'
import { Agent } from './agent'

if (!process.env.TELEGRAM_TOKEN) {
  log('fatal', 'Missing environment variable TELEGRAM_TOKEN.')
  process.exit()
}

const bot = new Telegraf(process.env.TELEGRAM_TOKEN)

bot.start((ctx) => {
  ctx.reply("GREETINGS FELLOW HUMAN\n\nI'm a GPT-3.5 language model. I can google and I understand voice messages. Ask me anything")
})

bot.help((ctx) => {
  ctx.reply("I'm a GPT-3.5 language model. I can google and I understand voice messages. Ask me anything")
})

const agent = new Agent()
bot.on(message(), async (ctx) => {
  const text = (ctx.message as any).text
  if (!text) {
    ctx.reply("Please send a text message.")
    return
  }

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

bot.launch()
log('info', "🚀 Bot launched")

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
