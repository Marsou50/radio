import { copyFileSync, cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve('dist');
const compiledSource = resolve(dist, 'index.source.html');
if (existsSync(compiledSource)) {
  copyFileSync(compiledSource, resolve(dist, 'index.html'));
  rmSync(compiledSource);
}

// Le dépôt est actuellement configuré en publication Pages « legacy » à la racine.
// Ces fichiers compilés permettent au site public de fonctionner sans réglage manuel.
for (const folder of ['assets', 'images']) {
  const target = resolve(folder);
  rmSync(target, { recursive: true, force: true });
  cpSync(resolve(dist, folder), target, { recursive: true });
}
copyFileSync(resolve(dist, 'index.html'), resolve('index.html'));
copyFileSync(resolve(dist, 'favicon.svg'), resolve('favicon.svg'));
