import { spawn } from 'node:child_process'

export async function captureProcess(input, context) {
  const pythonCommand = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3')
  const scriptPath = `${process.cwd()}/python/process_capture_agent.py`
  const timeout = Number(process.env.GEMINI_TIMEOUT_MS || 20000) + 5000
  const payload = JSON.stringify({ input, context })

  return new Promise((resolve, reject) => {
    const child = spawn(pythonCommand, [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' } })
    let stdout = ''
    let stderr = ''
    let settled = false
    const timer = setTimeout(() => child.kill(), timeout)
    child.stdout.on('data', (chunk) => { stdout += chunk })
    child.stderr.on('data', (chunk) => { stderr += chunk })
    child.on('error', (error) => {
      clearTimeout(timer)
      if (!settled) { settled = true; reject(providerError(error.message)) }
    })
    child.on('close', (code, signal) => {
      clearTimeout(timer)
      if (settled) return
      settled = true
      if (signal) return reject(providerError(signal === 'SIGTERM' ? 'Python process capture timed out' : stderr))
      try {
        const response = JSON.parse(stdout)
        if (!response.ok) {
          const error = new Error(response.message)
          error.code = response.code
          return reject(error)
        }
        return resolve(response.result)
      } catch {
        return reject(providerError(stderr || `Python process exited with code ${code}`))
      }
    })
    child.stdin.end(payload)
  })
}

function providerError(message) {
  const error = new Error(message)
  error.code = 'GEMINI_PROVIDER_ERROR'
  error.retryable = true
  return error
}
