import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const assets = (await readdir('dist', { recursive: true, withFileTypes: true })).filter(e => e.isFile() && e.name !== 'sw.js').map(e => (e.parentPath + '/' + e.name).replaceAll('\\', '/').replace(/^dist\//, './'));
const hash = createHash('sha256');
for (const asset of assets.sort()) hash.update(await readFile('dist/' + asset.slice(2)));
const version = 'truco-' + hash.digest('hex').slice(0, 12);
await writeFile('dist/sw.js', `const CACHE=${JSON.stringify(version)};
const ASSETS=${JSON.stringify(assets)};
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('truco-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Response.error())));
});`);
console.log('Offline cache:', version, assets.length, 'files');
