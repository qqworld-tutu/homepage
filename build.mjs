import { readFile, mkdir, copyFile, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { profileView } from './profile-view.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'content.json'), 'utf8'));
const output = path.join(root, 'dist');
// Changed assets get a new URL so returning visitors cannot reuse stale CSS/JS.
async function versionedAsset(file) {
  const contents = await readFile(path.join(root, file));
  const version = createHash('sha256').update(contents).digest('hex').slice(0, 12);
  return `${file}?v=${version}`;
}
const stylesheet = await versionedAsset('profile.css');
const script = await versionedAsset('app.js');
const escape = (value = '') => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function url(value) {
  const parsed = new URL(value);
  if (!['https:', 'http:', 'mailto:'].includes(parsed.protocol)) throw new Error('Unsupported URL protocol');
  return escape(parsed.href);
}
const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="description" content="${escape(data.intro[0])}">
  <title>${escape(data.name)} · ${escape(data.chineseName)}</title>
  <link rel="canonical" href="${url(data.siteUrl)}">
  <link rel="icon" href="avatar.jpg">
  <script>try{const t=localStorage.getItem('quan-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}catch{}</script>
  <link rel="stylesheet" href="${stylesheet}">
  <script src="${script}" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <div id="content">${profileView({data,escape,safeUrl:url})}</div>
</body>
</html>`;

// This directory contains generated output only. Rebuild it to drop stale pages.
await rm(output, {recursive:true, force:true});
await mkdir(path.join(output, 'assets'), {recursive:true});
await writeFile(path.join(output, 'index.html'), html);
await writeFile(path.join(output, '.nojekyll'), '');
if (data.siteUrl) await writeFile(path.join(output, 'CNAME'), new URL(data.siteUrl).hostname + '\n');
await copyFile(path.join(root, 'profile.css'), path.join(output, 'profile.css'));
await copyFile(path.join(root, 'app.js'), path.join(output, 'app.js'));
await copyFile(path.join(root, data.avatar), path.join(output, data.avatar));
await copyFile(path.join(root, data.avatar), path.join(output, 'avatar.jpg'));
// Keep links shared before the main domain became the academic homepage working.
const legacyPaths = JSON.parse(await readFile(path.join(root, 'legacy-blog-paths.json'), 'utf8'));
for (const legacyPath of legacyPaths) {
  if (!legacyPath.endsWith('/index.html') || legacyPath.split('/').includes('..') || legacyPath.startsWith('/')) {
    throw new Error(`Invalid legacy blog path: ${legacyPath}`);
  }
  const destination = new URL(legacyPath.slice(0, -'index.html'.length), data.blog).href;
  const target = path.join(output, legacyPath);
  await mkdir(path.dirname(target), {recursive:true});
  const scriptUrl = JSON.stringify(destination).replace(/</g, '\\u003c');
  await writeFile(target, `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Moved to QQ’s Blog</title><link rel="canonical" href="${url(destination)}"><script>location.replace(${scriptUrl}+location.search+location.hash)</script><meta http-equiv="refresh" content="0;url=${url(destination)}"><p>This page has moved to <a href="${url(destination)}">QQ’s Blog</a>.</p></html>`);
}
await cp(path.join(root, 'legacy-images'), path.join(output, 'images'), {recursive:true});
await writeFile(path.join(output, '404.html'), `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Page not found</title><body><h1>Page not found</h1><p><a href="${url(data.siteUrl)}">Academic homepage</a> · <a href="${url(data.blog)}">QQ’s Blog</a></p></body></html>`);
console.log(`Academic homepage built: ${path.join(output, 'index.html')}`);
