export default function log(level: string, ...messages: string[]) {
  process.stderr.write(`[${new Date().toISOString()}][${level}] ${messages.join(' ')}\n`)
}
