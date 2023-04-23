import { CallbackManager } from "langchain/callbacks"
import { CallbackHandler } from "./callbackHandler"

export function requestContext() {
  const callbackManager = new CallbackManager()
  callbackManager.addHandler(new CallbackHandler())
  return {
    openAIApiKey: process.env.OPENAI_API_KEY,
    callbackManager,
  }
}

const pricing = {
  'gpt-3.5-turbo': 0.002 / 1000,  // per token
  image: 0.02,                    // per 1024x1024 image
}

export async function sendCostInfo(ctx: any, { model, count }: { model: keyof typeof pricing, count: number }) {
  const cost = pricing[model] * count
  const unit = ['image'].includes(model) ? model : 'token'
  return ctx.reply(`<code>💲 ${count} ${unit}${count > 1 && 's'} ~ $${cost.toFixed(5)}</code>`, { parse_mode: 'HTML' })
}
