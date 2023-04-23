import { ChatOpenAI } from "langchain/chat_models/openai"
import { Configuration, OpenAIApi } from "openai"
import { AgentExecutor, Tool, initializeAgentExecutorWithOptions } from "langchain/agents"
import { googleTool } from "./lib/tools/google"
import log from "./utils/log"
import { CallbackManager } from "langchain/callbacks"
import { CallbackHandler } from "./lib/callbackHandler"

if (!process.env.OPENAI_API_KEY) {
  log('fatal', 'Missing environment variable OPENAI_API_KEY.')
  process.exit()
}

const callbackManager = new CallbackManager()
callbackManager.addHandler(new CallbackHandler())

const params = {
  temperature: 1,
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: process.env.OPENAI_MODEL || "gpt-4",
  maxConcurrency: 1,
  maxTokens: 1000,
  maxRetries: 5,
  callbackManager,
}

export class Agent {
  public tools: Tool[]
  public executor?: AgentExecutor
  public model: ChatOpenAI
  public openai: OpenAIApi

  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    })

    this.tools = [googleTool]
    this.model = new ChatOpenAI(params, configuration)
    this.openai = new OpenAIApi(configuration)
  }

  public async call(input: string) {
    if (!this.executor) {
      this.executor = await initializeAgentExecutorWithOptions(this.tools, this.model, {
        agentType: "chat-conversational-react-description",
        callbackManager,
      })
      // TODO: history per user
      // this.executor.memory = new BufferMemory({
      //   returnMessages: true,
      //   memoryKey: "chat_history",
      //   inputKey: "input",
      // })
    }

    const response = await this.executor.call({ input })
    return response.output
  }
}
