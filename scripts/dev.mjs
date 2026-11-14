import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = portIndex >= 0 ? args[portIndex + 1] : (process.env.PORT ?? '3000');
// The preview runner supplies Vite-style flags. Next only needs the port.
const children = [];
if (process.env.AGRO_DEV_BACKEND) {
  const root = resolve(process.env.AGRO_DEV_BACKEND);
  const python = resolve(
    root,
    '.venv',
    process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python',
  );
  children.push(
    spawn(python, ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'], {
      cwd: root,
      stdio: 'inherit',
    }),
  );
}
const next = spawn(
  process.execPath,
  ['node_modules/next/dist/bin/next', 'dev', '--webpack', '--hostname', '0.0.0.0', '--port', port],
  { stdio: 'inherit' },
);
children.push(next);
const stop = () => children.forEach((child) => child.kill('SIGTERM'));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
next.on('exit', (code) => {
  stop();
  process.exit(code ?? 0);
});
