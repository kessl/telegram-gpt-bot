import { BaseCallbackHandler } from "langchain/callbacks";
import { AgentAction, AgentFinish, ChainValues, LLMResult } from "langchain/dist/schema";
import log from "../utils/log";

export class CallbackHandler extends BaseCallbackHandler {
  async handleLLMStart(llm: { name: string }, prompts: string[], verbose?: boolean) { log('debug', 'handleLLMStart', { llm, prompts, verbose }) }
  async handleLLMNewToken(token: string, verbose: boolean) { log('debug', 'handleLLMNewToken', { token, verbose }) }
  async handleLLMError(err: Error, verbose: boolean) { log('debug', 'handleLLMError', { err, verbose }) }
  async handleLLMEnd(output: LLMResult, verbose: boolean) { log('debug', 'handleLLMEnd', { output, verbose }) }
  async handleChainStart(chain: { name: string }, inputs: ChainValues, verbose: boolean) { log('debug', 'handleChainStart', { chain, inputs, verbose }) }
  async handleChainError(err: Error, verbose: boolean) { log('debug', 'handleChainError', { err, verbose }) }
  async handleChainEnd(outputs: ChainValues, verbose: boolean) { log('debug', 'handleChainEnd', { outputs, verbose }) }
  async handleToolStart(tool: { name: string }, input: string, verbose: boolean) { log('debug', 'handleToolStart', { tool, input, verbose }) }
  async handleToolError(err: Error, verbose: boolean) { log('debug', 'handleToolError', { err, verbose }) }
  async handleToolEnd(output: string, verbose: boolean) { log('debug', 'handleToolEnd', { output, verbose }) }
  async handleText(text: string, verbose: boolean) { log('debug', 'handleText', { text, verbose }) }
  async handleAgentAction(action: AgentAction, verbose: boolean) { log('debug', 'handleAgentAction', { action, verbose }) }
  async handleAgentEnd(action: AgentFinish, verbose: boolean) { log('debug', 'handleAgentEnd', { action, verbose }) }
}
