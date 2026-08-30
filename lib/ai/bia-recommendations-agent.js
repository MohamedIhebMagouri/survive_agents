import { spawn } from 'node:child_process'

export async function generateBiaRecommendations(payload) {
  const command = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3')
  const timeout = Number(process.env.BIA_RECOMMENDATIONS_TIMEOUT_MS || 30000)
  return new Promise((resolve, reject) => {
    const child = spawn(command, [`${process.cwd()}/python/bia_recommendations_agent.py`], { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' } })
    let stdout = '', stderr = '', settled = false
    const timer = setTimeout(() => child.kill(), timeout)
    child.stdout.on('data', (chunk) => { stdout += chunk }); child.stderr.on('data', (chunk) => { stderr += chunk })
    child.on('error', (error) => { clearTimeout(timer); if (!settled) { settled = true; const wrapped = new Error(error.message); wrapped.code = 'BIA_RECOMMENDATIONS_PROVIDER_ERROR'; reject(wrapped) } })
    child.on('close', (code, signal) => { clearTimeout(timer); if (settled) return; settled = true; if (signal) { const error = new Error('Le calcul des recommandations a dépassé le délai autorisé.'); error.code = 'BIA_RECOMMENDATIONS_TIMEOUT'; return reject(error) } try { const response = JSON.parse(stdout); if (!response.ok) { const error = new Error(response.message); error.code = response.code; return reject(error) } resolve(response.result) } catch { const error = new Error(stderr || `Python exited with ${code}`); error.code = 'BIA_RECOMMENDATIONS_OUTPUT_ERROR'; reject(error) } })
    child.stdin.end(JSON.stringify(payload))
  })
}
