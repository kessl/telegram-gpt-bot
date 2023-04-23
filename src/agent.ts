import { ChatOpenAI } from "langchain/chat_models/openai"

import { AgentExecutor, Tool, initializeAgentExecutorWithOptions } from "langchain/agents"
import { googleTool } from "./lib/tools/google"
import log from "./utils/log"

if (!process.env.OPENAI_API_KEY) {
  log('fatal', 'Missing environment variable OPENAI_API_KEY.')
  process.exit()
}

export class Agent {
  public tools: Tool[]
  public executor?: AgentExecutor
  public model: ChatOpenAI
  params: any

  constructor(baseParams: any) {
    const params = {
      temperature: 1,
      modelName: process.env.OPENAI_MODEL || "gpt-4",
      maxConcurrency: 1,
      maxTokens: 1000,
      maxRetries: 5,
    }

    this.params = { ...baseParams, ...params }
    this.tools = [googleTool]
    this.model = new ChatOpenAI(this.params)
  }

  public async call(input: string) {
    if (!this.executor) {
      this.executor = await initializeAgentExecutorWithOptions(this.tools, this.model, {
        agentType: "chat-conversational-react-description",
        callbackManager: this.params.callbackManager,
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
