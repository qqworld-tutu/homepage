const root=document.documentElement;
const header=document.querySelector('.site-header');
const themeButton=document.querySelector('.theme-button');
const sections=[...document.querySelectorAll('.profile-main > section[id]')];
const links=[...document.querySelectorAll('.navigation nav a[href^="#"]')];
const media=matchMedia('(prefers-color-scheme: dark)');
const wechat=document.querySelector('.wechat-contact');
if(wechat){
  document.addEventListener('click',event=>{
    if(!wechat.contains(event.target))wechat.open=false;
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&wechat.open){
      wechat.open=false;
      wechat.querySelector('summary').focus();
    }
  });
}
let preference;
try { preference=localStorage.getItem('quan-theme'); } catch {}
function setTheme(theme) {
  root.dataset.theme=theme;
  const label=theme==='dark'?'Switch to light theme':'Switch to dark theme';
  themeButton.setAttribute('aria-label',label);
  themeButton.title=label;
}
setTheme(['light','dark'].includes(preference)?preference:media.matches?'dark':'light');
themeButton.hidden=false;
themeButton.addEventListener('click',()=>{
  preference=root.dataset.theme==='dark'?'light':'dark';
  setTheme(preference);
  try { localStorage.setItem('quan-theme',preference); } catch {}
});
media.addEventListener('change',event=>{if(!preference)setTheme(event.matches?'dark':'light');});
let ticking=false;
let selectedSection=null;
for(const link of links)link.addEventListener('click',()=>{
  selectedSection=link.hash.slice(1);
  requestAnimationFrame(updateReading);
});
// Short final sections can share the same bottom scroll position. Keep the
// clicked section active until the reader resumes scrolling manually.
addEventListener('wheel',()=>{selectedSection=null;requestAnimationFrame(updateReading);},{passive:true});
addEventListener('touchstart',()=>{selectedSection=null;},{passive:true});
addEventListener('keydown',event=>{
  if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key))selectedSection=null;
});
function updateReading() {
  ticking=false;
  root.style.setProperty('--anchor-offset',`${header.offsetHeight+24}px`);
  header.classList.toggle('is-scrolled',scrollY>12);
  let current=sections[0].id;
  for(const section of sections)if(section.getBoundingClientRect().top<=header.offsetHeight+35)current=section.id;
  if(scrollY>0&&scrollY+innerHeight>=root.scrollHeight-3){
    current=sections.at(-1).id;
    const selected=sections.find(section=>section.id===selectedSection);
    if(selected){
      const bounds=selected.getBoundingClientRect();
      if(bounds.top<innerHeight&&bounds.bottom>header.offsetHeight)current=selected.id;
    }
  }
  for(const link of links) {
    if(link.hash===`#${current}`)link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
  }
}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(updateReading);}},{passive:true});
addEventListener('resize',updateReading);
updateReading();
