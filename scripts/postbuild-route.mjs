import { mkdir, copyFile } from 'node:fs/promises';
const target = 'dist/blog/github-for-beginners';
await mkdir(target, { recursive: true });
await copyFile('dist/index.html', `${target}/index.html`);
console.log('Created direct static route: /blog/github-for-beginners/');
