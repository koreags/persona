import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST() {
  const cwd = path.join(process.cwd(), 'crawler')

  return new Promise(resolve => {
    const logs = []

    const py = spawn('python', ['crawler.py'], {
      cwd,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    })

    py.stdout.on('data', data => logs.push(data.toString()))
    py.stderr.on('data', data => logs.push(data.toString()))

    py.on('close', code => {
      if (code === 0) {
        resolve(NextResponse.json({ ok: true, log: logs.join('') }))
      } else {
        resolve(NextResponse.json({ ok: false, log: logs.join('') }, { status: 500 }))
      }
    })

    py.on('error', err => {
      resolve(NextResponse.json({ ok: false, log: err.message }, { status: 500 }))
    })
  })
}
