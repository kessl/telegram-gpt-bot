import { inspect } from 'util'

function inspectMessage(message: any) {
  if (typeof message === 'object') {
    return inspect(message)
  }
  return message
}

export default function log(level: string, ...messages: any[]) {
  process.stderr.write(`[${new Date().toISOString()}][${level}] ${messages.map(inspectMessage).join(' ')}\n`)
}
