import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname);

const prismaBin = resolve(root, 'node_modules', 'prisma', 'build', 'index.js');

if (existsSync(prismaBin)) {
  execSync(`node "${prismaBin}" generate`, { stdio: 'inherit', cwd: root });
} else {
  execSync('npx --yes prisma@6.4.1 generate', { stdio: 'inherit', cwd: root });
}

execSync('npx next build', { stdio: 'inherit', cwd: root });
