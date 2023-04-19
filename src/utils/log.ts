import { inspect } from 'util'

const levels = {
  debug: 0,
  info: 1,
  error: 2,
  fatal: 3,
}
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info') as keyof typeof levels

function inspectMessage(message: any) {
  if (typeof message === 'object') {
    return inspect(message)
  }
  return message
}

export default function log(level: keyof typeof levels, ...messages: any[]) {
  if (levels[level] < levels[LOG_LEVEL]) return
  process.stderr.write(`[${new Date().toISOString()}][${level}] ${messages.map(inspectMessage).join(' ')}\n`)
}
