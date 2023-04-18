import dotenv from 'dotenv'
dotenv.config()
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import log from './utils/log'

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

bot.on(message(), async (ctx) => {
  const text = (ctx.message as any).text
  if (!text) {
    ctx.reply("Please send a text message.")
    return
  }

  log('debug', "Received:", text)
  ctx.reply("Received: " + text)
})

bot.launch()
log('info', "🚀 Bot launched")

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
