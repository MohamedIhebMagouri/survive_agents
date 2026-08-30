import { spawn } from 'node:child_process'
export async function calculateRecoveryMetrics(payload) {
  const command = process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3')
  return new Promise((resolve, reject) => {
    const child = spawn(command, [`${process.cwd()}/python/recovery_metrics_agent.py`], { stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' } })
    let out = '', err = ''; const timer = setTimeout(() => child.kill(), Number(process.env.RECOVERY_METRICS_TIMEOUT_MS || 30000))
    child.stdout.on('data', (c) => { out += c }); child.stderr.on('data', (c) => { err += c })
    child.on('error', reject); child.on('close', (code, signal) => { clearTimeout(timer); if (signal) { const e = new Error('Recovery metrics timed out'); e.code = 'RECOVERY_METRICS_TIMEOUT'; return reject(e) } try { const parsed = JSON.parse(out); if (!parsed.ok) { const e = new Error(parsed.message); e.code = parsed.code; return reject(e) } resolve(parsed.result) } catch { const e = new Error(err || `Python exited with ${code}`); e.code = 'RECOVERY_METRICS_OUTPUT_ERROR'; reject(e) } })
    child.stdin.end(JSON.stringify(payload))
  })
}
