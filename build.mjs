import { readFile, mkdir, copyFile, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(await readFile(path.join(root, 'content.json'), 'utf8'));
const output = path.join(root, 'dist');
const escape = (value = '') => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
function url(value) {
  if (!/^(https?:\/\/|mailto:)/.test(value)) throw new Error(`Expected an http(s) or mailto URL: ${value}`);
  return escape(value);
}
const arrow = '<span aria-hidden="true">↗</span>';
const entries = (items) => items.map(item => `<article class="entry"><div class="entry-heading"><h3>${escape(item.institution || item.title)}</h3>${item.dates ? `<span class="date">${escape(item.dates)}</span>` : ''}</div>${item.degree ? `<p class="entry-subtitle">${escape(item.degree)}</p>` : ''}<p class="muted">${escape(item.detail || item.description)}</p>${item.url ? `<a class="text-link" href="${url(item.url)}">Learn more ${arrow}</a>` : ''}</article>`).join('');
const sections = [ ['about','About'], ['education','Education'] ];
if (data.experience.length) sections.push(['experience','Experience']);
if (data.publications.length) sections.push(['publications','Publications']);
if (data.projects.length) sections.push(['projects','Projects']);
if (data.writing.length) sections.push(['writing','Writing']);

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="description" content="${escape(`${data.name} (${data.chineseName}), ${data.role} at ${data.affiliation}. Mathematics, Computer Science, and large language models.`)}">
  <title>${escape(data.name)} · ${escape(data.chineseName)}</title>
  ${data.siteUrl ? `<link rel="canonical" href="${url(data.siteUrl)}">` : ''}
  <link rel="icon" href="${escape(data.avatar)}">
  <script>try{const t=localStorage.getItem('quan-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch{}</script>
  <link rel="stylesheet" href="./editorial.css">
  <script src="./app.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="topbar"><div class="topbar-inner">
    <a class="wordmark" href="#about" aria-label="Quan Chen, home"><span lang="zh">${escape(data.chineseName)}</span><span class="wordmark-caption">PERSONAL HOMEPAGE</span></a>
    <nav aria-label="Main navigation"><a class="current" href="#about" aria-current="page">Home</a><a href="${url(data.blog)}">Blog ${arrow}</a><a href="mailto:${escape(data.email)}">Contact</a></nav>
    <button class="theme-toggle" type="button" aria-label="Switch color theme" title="Switch color theme"><span aria-hidden="true">◐</span></button>
  </div></header>
  <div class="layout">
    <main id="main">
      <section class="about-section" id="about">
        <div class="intro-heading"><p class="eyebrow">${escape(data.affiliation)} · ${escape(data.role)}</p><h1>${escape(data.name)}<span class="name-dot">.</span></h1><p class="study-line">Mathematics <em>&</em> Computer Science</p></div>
        <figure class="portrait"><img class="avatar" src="${escape(data.avatar)}" alt="${escape(data.name)}'s rabbit avatar" width="180" height="180"><figcaption>${escape(data.location)}</figcaption></figure>
        <div class="intro-copy">${data.intro.map(p=>`<p>${escape(p)}</p>`).join('')}<div class="profile-links"><a href="mailto:${escape(data.email)}">Email ${arrow}</a><a href="${url(data.github)}">GitHub ${arrow}</a>${data.cv ? `<a href="${url(data.cv)}">CV ${arrow}</a>` : ''}</div></div>
        <nav class="section-nav" aria-label="On this page">${sections.filter(([id])=>id!=='about').map(([id,label]) => `<a href="#${id}">${label}</a>`).join('')}</nav>
      </section>
      <section id="education"><div class="section-title"><h2>Education</h2></div>${entries(data.education)}</section>
      ${data.experience.length ? `<section id="experience"><div class="section-title"><h2>Experience</h2></div>${entries(data.experience)}</section>` : ''}
      ${data.publications.length ? `<section id="publications"><div class="section-title"><h2>Publications</h2></div>${data.publications.map(p=>`<article class="entry"><h3>${escape(p.title)}</h3><p>${escape(p.authors)}</p><p class="muted">${escape(p.venue)}</p>${(p.links||[]).map(l=>`<a class="text-link" href="${url(l.url)}">${escape(l.label)} ${arrow}</a>`).join(' ')}</article>`).join('')}</section>` : ''}
      ${data.projects.length ? `<section id="projects"><div class="section-title"><h2>Projects</h2></div>${data.projects.map(p=>`<a class="project" href="${url(p.url)}"><div><h3>${escape(p.title)} ${arrow}</h3><p>${escape(p.description)}</p><span class="eyebrow">${escape(p.label)}</span></div></a>`).join('')}</section>` : ''}
      ${data.writing.length ? `<section id="writing"><div class="section-title"><h2>From the blog</h2><a href="${url(data.blog)}">All writing ${arrow}</a></div><div class="writing-list">${data.writing.map(p=>`<a class="writing-row" href="${url(new URL(p.path, data.blog.endsWith('/') ? data.blog : data.blog + '/').href)}"><div><span class="eyebrow" lang="zh">${escape(p.category)}</span><h3 lang="zh">${escape(p.title)}</h3></div><span class="writing-date">${escape(p.date)} ${arrow}</span></a>`).join('')}</div></section>` : ''}
      <footer><span>© ${new Date().getFullYear()} ${escape(data.name)}</span><a href="mailto:${escape(data.email)}">${escape(data.email)} ${arrow}</a></footer>
    </main>
  </div>
</body>
</html>`;

// This directory contains generated output only. Rebuild it to drop stale pages.
await rm(output, {recursive:true, force:true});
await mkdir(path.join(output, 'assets'), {recursive:true});
await writeFile(path.join(output, 'index.html'), html);
await writeFile(path.join(output, '.nojekyll'), '');
if (data.siteUrl) await writeFile(path.join(output, 'CNAME'), new URL(data.siteUrl).hostname + '\n');
await copyFile(path.join(root, 'editorial.css'), path.join(output, 'editorial.css'));
await copyFile(path.join(root, 'app.js'), path.join(output, 'app.js'));
await copyFile(path.join(root, data.avatar), path.join(output, data.avatar));
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
