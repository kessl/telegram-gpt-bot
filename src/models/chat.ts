import { ChatOpenAI } from "langchain/chat_models/openai"
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts"
import { ConversationChain } from "langchain/chains"
import { Configuration } from "openai"
import log from "../utils/log"

const openAIApiKey = process.env.OPENAI_API_KEY!

if (!process.env.OPENAI_API_KEY) {
  log('fatal', 'Missing environment variable OPENAI_API_KEY.')
  process.exit()
}

const params = {
  verbose: true,
  temperature: 1,
  openAIApiKey,
  modelName: process.env.OPENAI_MODEL || "gpt-4",
  maxConcurrency: 1,
  maxTokens: 1000,
  maxRetries: 5,
}

export class Model {
  public chain: ConversationChain

  constructor() {
    const configuration = new Configuration({
      apiKey: openAIApiKey,
    })

    const model = new ChatOpenAI(params, configuration)

    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "The following is a conversation between a human and an AI. If the AI does not know the answer to a question, it truthfully says it does not know."
      ),
      // new MessagesPlaceholder("history"),
      HumanMessagePromptTemplate.fromTemplate("{input}"),
    ])

    this.chain = new ConversationChain({
      // memory: new BufferMemory({ returnMessages: true }),
      prompt: chatPrompt,
      llm: model,
    })
    this.chain.verbose = true
  }

  public async call(input: string) {
    const output = await this.chain.call({ input })
    return
    return output.response
  }
}
