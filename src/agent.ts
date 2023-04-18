import { ChatOpenAI } from "langchain/chat_models/openai"
import { Configuration, OpenAIApi } from "openai"
import { AgentExecutor, Tool, initializeAgentExecutor } from "langchain/agents"
import { BufferMemory } from "langchain/memory"
import { googleTool } from "./lib/tools/google"
import log from "./utils/log"

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

export class Agent {
  public tools: Tool[]
  public executor?: AgentExecutor
  public model: ChatOpenAI
  public openai: OpenAIApi

  constructor() {
    const configuration = new Configuration({
      apiKey: openAIApiKey,
    })

    this.tools = [googleTool]
    this.model = new ChatOpenAI(params, configuration)
    this.openai = new OpenAIApi(configuration)
  }

  public async call(input: string) {
    if (!this.executor) {
      this.executor = await initializeAgentExecutor(
        this.tools,
        this.model,
        "chat-conversational-react-description",
        true
      )
      this.executor.memory = new BufferMemory({
        returnMessages: true,
        memoryKey: "chat_history",
        inputKey: "input",
      })
    }

    const response = await this.executor.call({ input })
    return response.output
  }
}
