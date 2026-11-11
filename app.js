(() => {
'use strict';
const projects = window.PORTFOLIO_PROJECTS || [];
const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const number = (n) => String(n).padStart(2, '0');
const dialog = $('#project-dialog');
let selectedFilter = 'All';
let activeProjectId = null;
let returnFocus = null;
let previousHash = '#work';
function card(project) {
 const index = projects.indexOf(project) + 1;
 const cover = project.images[0];
 return `<button class="project-card" type="button" data-project="${escapeHTML(project.id)}" aria-label="Open ${escapeHTML(project.title)}: ${escapeHTML(project.kind)}"><div class="card-media"><img src="${escapeHTML(assetURL(cover.file))}" alt="${escapeHTML(cover.caption)}" loading="lazy" decoding="async" width="900" height="650"><span class="card-index">${number(index)} / ${escapeHTML(project.category.toUpperCase())}</span><span class="card-open" aria-hidden="true">↗</span></div><div class="card-meta"><span>${escapeHTML(project.year)} / ${escapeHTML(project.kind)}</span><span>${escapeHTML(project.category)}</span></div><h3 class="card-title">${escapeHTML(project.title)}</h3><p class="card-description">${escapeHTML(project.summary)}</p></button>`;
}
function renderArchive() {
 const query = $('#project-search').value.trim().toLowerCase();
 const visible = projects.filter(project => (selectedFilter === 'All' || project.category === selectedFilter) && [project.title,project.subtitle,project.summary,project.institution,project.kind,project.year,...project.tools].join(' ').toLowerCase().includes(query));
 $('#archive-grid').innerHTML = visible.map(card).join('');
 $('#result-count').textContent = `${number(visible.length)} / ${projects.length} PROJECTS`;
 $('#empty-state').hidden = visible.length > 0;
}
function figure(image, cover = false) {
 return `<figure${cover ? ' class="case-cover"' : ''}><button class="image-open" type="button" data-image="${escapeHTML(image.file)}" data-caption="${escapeHTML(image.caption)}" aria-label="View full image: ${escapeHTML(image.caption)}"><img src="${escapeHTML(assetURL(image.file))}" alt="${escapeHTML(image.caption)}" loading="${cover ? 'eager' : 'lazy'}" decoding="async"><span class="image-open-label">VIEW FULL IMAGE +</span></button><figcaption>${escapeHTML(image.caption)}</figcaption></figure>`;
}
const assetObjectURLs = new Map();
function assetURL(file) {
 const value=(window.PORTFOLIO_ASSETS && window.PORTFOLIO_ASSETS[file]) || file;
 if(!/^data:(?:video\/|audio\/|application\/|text\/)/.test(value)) return value;
 if(assetObjectURLs.has(file)) return assetObjectURLs.get(file);
 const comma=value.indexOf(','),mime=value.slice(5,value.indexOf(';')),binary=atob(value.slice(comma+1));
 const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
 const url=URL.createObjectURL(new Blob([bytes],{type:mime}));assetObjectURLs.set(file,url);return url;
}

document.querySelectorAll('[data-portfolio-src]').forEach(el=>el.setAttribute('src',assetURL(el.getAttribute('data-portfolio-src'))));
document.querySelectorAll('[data-portfolio-href]').forEach(el=>el.setAttribute('href',assetURL(el.getAttribute('data-portfolio-href'))));

function projectVideosHTML(project) {
 const films=project.videos || [];
 if(!films.length) return '';
 const hosted=films.some(film=>/^https?:/i.test(film.src));
 return '<section class="case-videos" id="case-films" aria-label="Project films"><div class="case-video-heading"><div><span class="mono">PROJECT FILM / PROCESS IN MOTION</span><h3>See it in motion.</h3></div><p>Play when you are ready. No autoplay.<br>'+(hosted?'Hosted clips require an internet connection.':'Film included with this portfolio.')+'</p></div><div class="case-video-grid '+(films.length===1 || project.videoLayout==='stacked'?'single-film':'')+'">'+films.map(film=>'<figure class="case-video"><video controls playsinline preload="metadata"'+(film.poster?' poster="'+escapeHTML(assetURL(film.poster))+'"':'')+' aria-label="'+escapeHTML(film.label)+'"><source src="'+escapeHTML(assetURL(film.src))+'"'+(/\.mp4(?:$|\?)/i.test(film.src)?' type="video/mp4"':'')+'>'+(film.subtitles?'<track kind="subtitles" src="'+escapeHTML(assetURL(film.subtitles.src))+'" srclang="en" label="English">':'')+'Your browser cannot play this video. Use the original-video link below.</video><figcaption><strong>'+escapeHTML(film.label)+'</strong><p>'+escapeHTML(film.caption)+'</p>'+(film.credits?'<p class="film-credit">'+escapeHTML(film.credits)+'</p>':'')+'<div class="film-links"><a href="'+escapeHTML(assetURL(film.src))+'" target="_blank" rel="noopener noreferrer">Open video ↗</a>'+(film.source?' <a href="'+escapeHTML(film.source)+'" target="_blank" rel="noopener noreferrer">Credited source ↗</a>':'')+(film.captionDownload?' <a href="'+escapeHTML(assetURL(film.captionDownload))+'" download>English subtitles ↓</a>':'')+'</div>'+(film.transcript&&film.transcript.length?'<details class="film-transcript"><summary>Read English transcript</summary><ol>'+film.transcript.map(line=>'<li><time>'+escapeHTML(line.time)+'</time><span>'+escapeHTML(line.text)+'</span></li>').join('')+'</ol></details>':'')+'</figcaption></figure>').join('')+'</div></section>';
}
function pauseProjectVideos() { dialog.querySelectorAll('video').forEach(video=>video.pause()); }

function projectGalleryHTML(project) {
 if(project.images.length<=1) return '';
 const groups=project.galleryGroups || [];
 const body=groups.length?groups.map((group,i)=>{const images=group.files.map(file=>project.images.find(image=>image.file===file)).filter(Boolean);return '<section class="gallery-group" aria-labelledby="gallery-group-'+escapeHTML(group.id)+'"><div class="gallery-group-heading"><span class="mono">'+number(i+1)+' / '+number(images.length)+' FRAMES</span><h4 id="gallery-group-'+escapeHTML(group.id)+'">'+escapeHTML(group.title)+'</h4><p>'+escapeHTML(group.note)+'</p></div><div class="case-gallery">'+images.map(image=>figure(image)).join('')+'</div></section>';}).join(''):'<div class="case-gallery">'+project.images.slice(1).map(image=>figure(image)).join('')+'</div>';
 return '<section class="case-gallery-section" id="case-gallery" tabindex="-1"><div class="gallery-section-heading"><div><span class="mono">05 / VISUAL RECORD</span><h3>Look closer.</h3></div><p>Full frames. Process drawings. Physical evidence.<br>Open any image to fit or zoom.</p></div>'+body+'</section>';
}

function sculptaCleanHTML(project, downloadLink, next) {
 const image = file => figure(project.images.find(item=>item.file===file));
 const film=project.videos[0];
 const chapters=[['case-films','Film'],['case-overview','Idea'],['case-design','Design'],['case-prototype','Prototype'],['case-application','Application'],['case-credits','Credits']];
 const steps=[['Square base','sculpta-step-1.png'],['S-shaped body','sculpta-step-2.png'],['Cavity + ports','sculpta-step-3.png'],['Connection geometry','sculpta-step-4.png']];
 return '<div class="sc-clean">'+
 '<header class="case-header sc-header"><div class="case-meta"><span class="scope-badge">Individual thesis</span><span>'+escapeHTML(project.year)+'</span><span>MADE · ETSAV–UPC</span></div><h2 id="dialog-title">SCULPTA</h2><p class="case-subtitle">'+escapeHTML(project.subtitle)+'</p></header>'+
 '<nav class="case-chapters" aria-label="Case-study sections">'+chapters.map(([id,label])=>'<button type="button" data-case-jump="'+id+'">'+label+'</button>').join('')+'</nav>'+
 '<section class="sc-film" id="case-films" tabindex="-1" aria-label="SCULPTA project film"><video controls playsinline preload="metadata" poster="'+escapeHTML(assetURL(film.poster))+'" aria-label="'+escapeHTML(film.label)+'"><source src="'+escapeHTML(assetURL(film.src))+'" type="video/mp4">Your browser cannot play this film.</video><div class="sc-film-caption"><span>PROJECT FILM / 74.5 SEC</span><p>Design proposal + prototype documentation</p><a href="'+escapeHTML(assetURL(film.src))+'" target="_blank" rel="noopener">Open film ↗</a></div></section>'+
 '<section class="sc-block sc-overview" id="case-overview" tabindex="-1"><div><span class="sc-kicker">01 / THE IDEA</span><h3>A living skin.<br>Designed for care.</h3></div><div><p class="sc-lead">'+escapeHTML(project.caseStudy.context)+'</p><dl class="sc-facts"><div><dt>My role</dt><dd>Computational design, component development and prototyping</dd></div><div><dt>Material</dt><dd>PETG · desktop FDM</dd></div><div><dt>Stage</dt><dd>Printed studies + unbuilt system proposal</dd></div></dl></div></section>'+
 '<section class="sc-block" id="case-design" tabindex="-1"><div class="sc-section-heading"><span class="sc-kicker">02 / COMPONENT & CONNECTION</span><h3>One unit.<br>A connected field.</h3><p>A hollow S-shaped vessel coordinates liquid depth, a printable wall and connection ports.</p></div><div class="sc-component"><div class="sc-unit-sheet">'+image('assets/sculpta-unit-cutout.png')+'</div><div class="sc-connection"><h4>Separate the jobs at the joint.</h4><p>The JOIN proposal separates alignment, sealing and retention so that a connection can be accessed and removed.</p>'+image('assets/sculpta-join-detail.jpg')+'<p class="sc-small">PETG body · proposed TPU seals · removable fasteners. Final sealing and repeated removal are not yet verified.</p></div></div><div class="sc-steps" aria-label="Component generation sequence">'+steps.map(([title,file],i)=>'<div class="sc-step"><img src="'+escapeHTML(assetURL('assets/'+file))+'" alt="'+escapeHTML(title)+'" loading="lazy"><span>0'+(i+1)+'</span><h4>'+escapeHTML(title)+'</h4></div>').join('')+'</div></section>'+
 '<section class="sc-block" id="case-prototype" tabindex="-1"><div class="sc-section-heading"><span class="sc-kicker">03 / PHYSICAL STUDIES</span><h3>Print. Observe. Revise.</h3><p>Printed samples explored repetition, print quality and handling. They are not evidence of a working cultivation system.</p></div><div class="sc-photo-pair">'+image('assets/sculpta-prototype-front.jpg')+image('assets/sculpta-prototype-edge.jpg')+'</div><div class="sc-revision">'+image('assets/sculpta-handling-samples.jpg')+'<div><h4>Handling changed the geometry.</h4><div class="sc-revision-row"><span>R1</span><div><strong>1.0 mm nominal face</strong><p>Breakage was observed around the shoulder and support-contact areas.</p></div></div><div class="sc-revision-row"><span>R2</span><div><strong>1.2 mm nominal face</strong><p>A smoother shoulder and revised support strategy informed the next iteration.</p></div></div><p class="sc-small">Design iteration, not an isolated strength test.</p></div></div></section>'+
 '<section class="sc-block" id="case-application" tabindex="-1"><div class="sc-section-heading"><span class="sc-kicker">04 / ARCHITECTURAL APPLICATION</span><h3>From component<br>to architecture.</h3><p>An independent frame carries the repeated units. Connections, circulation routes and replacement access are developed together.</p></div>'+image('assets/sculpta-system-render.jpg')+'<div class="sc-status"><div><h4>Documented</h4><p>Parametric geometry, printed specimens and handling-led design revisions.</p></div><div><h4>Still to validate</h4><p>Containment, final joint sealing, circulation, cultivation and structural / thermal performance.</p></div></div></section>'+
 '<section class="sc-block sc-credits" id="case-credits" tabindex="-1"><details><summary>Documentation & credits <span>+</span></summary><div class="sc-documentation"><h4>My contribution</h4><p>'+escapeHTML(project.role)+'</p><h4>Team / supervision</h4><p>'+escapeHTML(project.team)+'</p><h4>Images & film</h4><p>'+escapeHTML(project.mediaCredit)+'</p><p>Figures were recovered from the source material, individually cropped and recaptioned. Only the CAD unit’s backdrop was removed; physical prototype geometry was not altered.</p><div class="case-links">'+downloadLink+'</div><p class="sc-small">The 44-page atlas is a nominal CAD study. It does not establish manufacturing tolerances, hydraulic performance or collision-free removal.</p></div></details></section>'+
 '<footer class="case-bottom"><button type="button" data-project="'+escapeHTML(next.id)+'"><span>NEXT PROJECT / 02</span>'+escapeHTML(next.title)+'</button><span aria-hidden="true">↗</span></footer></div>';
}

function caseStudyHTML(project, sourceLink, downloadLink, next, index) {
 if(project.layout==='sculpta-clean') return sculptaCleanHTML(project,downloadLink,next);

 const study=project.caseStudy || {};
 const decisions=study.decisions || [], steps=study.workflow || [], findings=study.findings || [];
 const metrics=study.metrics || [], sources=study.sourceEvidence || [], nextSteps=study.nextSteps || [];
 const readingWords=[study.context,study.application,project.method,project.role,project.limits,...decisions.map(s=>s.text),...steps.map(s=>s.text),...findings.map(s=>s.text)].join(' ').split(/\s+/).length;
 const quickNav=[['case-films','Film'],['case-overview','Overview'],['case-decisions','Decisions'],['case-process','Process'],['case-findings','Findings'],['case-gallery','Gallery'],['case-credits','Credits']].filter(([id])=>(id!=='case-gallery'||project.images.length>1)&&(id!=='case-films'||(project.videos||[]).length>0)).map(([id,label])=>'<button type="button" data-case-jump="'+id+'">'+label+'</button>').join('');
 const metricsHTML=metrics.length ? '<div class="case-metrics">'+metrics.map(m=>'<div><strong>'+escapeHTML(m.value)+'</strong><span>'+escapeHTML(m.label)+'</span><small>'+escapeHTML(m.note)+'</small></div>').join('')+'</div>' : '';
 const decisionsHTML=decisions.map((d,i)=>'<div class="decision-card"><span class="mono">'+number(i+1)+'</span><h4>'+escapeHTML(d.title)+'</h4><p>'+escapeHTML(d.text)+'</p></div>').join('');
 const stepsHTML=steps.map((s,i)=>{const linkedImage=project.images.find(image=>image.file===s.image);return '<div class="process-step"><span class="process-number mono">'+number(i+1)+'</span><div><h4>'+escapeHTML(s.title)+'</h4><p>'+escapeHTML(s.text)+'</p>'+(linkedImage ? '<div class="process-image">'+figure(linkedImage)+'</div>' : '')+'</div></div>';}).join('');
 const findingsHTML=findings.map((f,i)=>'<div class="finding-item"><span class="mono">'+number(i+1)+'</span><div><h4>'+escapeHTML(f.title)+'</h4><p>'+escapeHTML(f.text)+'</p></div></div>').join('');
 const sourcesHTML=sources.map(s=>'<li>'+(s.url?'<a href="'+escapeHTML(assetURL(s.url))+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(s.note)+' ↗</a>':escapeHTML(s.note))+'</li>').join('');
 const archiveLink=project.archiveDownload ? '<a class="text-link" href="'+escapeHTML(assetURL(project.archiveDownload))+'" download="so101-workspace-study.zip">Download reproducible study <span aria-hidden="true">↓</span></a>' : '';
 const extraMedia=(project.videoLinks || []).map(v=>'<a class="text-link" href="'+escapeHTML(v.url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(v.label || 'Watch project film')+' <span aria-hidden="true">↗</span></a>').join('');
 const imageCredit=project.mediaCredit || project.imageCredit || (project.source && project.institution.startsWith('IAAC') ? 'Credited IAAC project documentation and existing portfolio.' : project.id.startsWith('so101') ? 'AI-assisted simulation outputs and technical communication.' : 'Existing portfolio drawings, visualisations and photographs.');
 return '<header class="case-header"><div class="case-meta"><span class="scope-badge">'+escapeHTML(project.kind)+'</span><span>'+escapeHTML(project.year)+'</span><span>'+escapeHTML(project.institution)+'</span><span class="case-readtime">'+Math.max(2,Math.ceil(readingWords/180))+' MIN READ</span></div><h2 id="dialog-title">'+escapeHTML(project.title)+'</h2><p class="case-subtitle">'+escapeHTML(project.subtitle)+'</p></header><nav class="case-chapters" aria-label="Case-study sections">'+quickNav+'</nav>'+figure(project.images[0],true)+projectVideosHTML(project)+
 '<section class="case-section case-overview" id="case-overview" tabindex="-1"><div class="case-section-label"><span class="mono">01 / OVERVIEW</span><h3>The task.<br>The context.</h3></div><div class="case-section-content"><p class="case-intro">'+escapeHTML(study.context || project.brief)+'</p><div class="case-application"><span class="mono">APPLICATION LENS</span><p>'+escapeHTML(study.application || project.brief)+'</p></div><div class="case-deliverable"><span class="mono">DOCUMENTED OUTPUT</span><p>'+escapeHTML(study.outcomeSummary || project.summary)+'</p></div><div class="method-tags">'+project.tools.map(t=>'<span>'+escapeHTML(t)+'</span>').join('')+'</div></div></section>'+metricsHTML+
 '<section class="case-section" id="case-decisions" tabindex="-1"><div class="case-section-label"><span class="mono">02 / DESIGN DECISIONS</span><h3>Why this<br>approach?</h3></div><div class="decision-grid">'+decisionsHTML+'</div></section>'+
 '<section class="case-section" id="case-process" tabindex="-1"><div class="case-section-label"><span class="mono">03 / PROCESS</span><h3>From question<br>to experiment.</h3><p class="case-section-note">'+escapeHTML(project.kind.includes('Team') || project.institution.startsWith('IAAC') ? 'The workflow below describes the team project. Individual responsibilities are stated in the credits.' : 'The workflow follows the documented study. Proposed next actions are separated from completed work.')+'</p></div><div class="process-list">'+stepsHTML+'</div></section>'+
 '<section class="case-section" id="case-findings" tabindex="-1"><div class="case-section-label"><span class="mono">04 / FINDINGS</span><h3>What the work<br>actually shows.</h3></div><div class="case-section-content">'+findingsHTML+'<div class="case-boundary"><h4>Evidence boundary</h4><p>'+escapeHTML(project.limits)+'</p></div>'+(nextSteps.length?'<div class="case-nextsteps"><h4>Next validation / development</h4><ol>'+nextSteps.map(s=>'<li>'+escapeHTML(s)+'</li>').join('')+'</ol><span class="mono">PROPOSED NEXT STEPS / NOT COMPLETED OUTCOMES</span></div>':'')+'</div></section>'+
 projectGalleryHTML(project)+
 '<section class="case-section case-credits" id="case-credits" tabindex="-1"><div class="case-section-label"><span class="mono">06 / CONTRIBUTION & SOURCES</span><h3>Who did what.<br>What supports it.</h3></div><div class="case-section-content"><h4>'+escapeHTML(project.role.startsWith('My contribution') || project.kind==='Individual thesis' ? 'My contribution' : 'Contribution / team context')+'</h4><p>'+escapeHTML(project.role)+'</p><h4>Team / supervision</h4><p>'+escapeHTML(project.team)+'</p><h4>Image / film credits</h4><p>'+escapeHTML(imageCredit)+'</p>'+(sources.length?'<h4>Source record</h4><ul class="case-source-list">'+sourcesHTML+'</ul>':'')+'<div class="case-links">'+sourceLink+downloadLink+archiveLink+extraMedia+'</div></div></section>'+
 '<footer class="case-bottom"><button type="button" data-project="'+escapeHTML(next.id)+'"><span>NEXT PROJECT / '+number(((index+1)%projects.length)+1)+'</span>'+escapeHTML(next.title)+'</button><span aria-hidden="true">↗</span></footer>';
}

function openProject(id, setHash = true) {
 const project = projects.find(item => item.id === id);
 if (!project) return;
 pauseProjectVideos();
 if (!dialog.open) {
  returnFocus = document.activeElement;
  previousHash = location.hash.startsWith('#project/') ? '#work' : (location.hash || '#work');
 }
 activeProjectId = project.id;
 const index = projects.indexOf(project);
 const next = projects[(index + 1) % projects.length];
 $('#dialog-index').textContent = `PROJECT / ${number(index + 1)} OF ${projects.length}`;
 const sourceLink = project.source ? `<a class="text-link" href="${escapeHTML(project.source)}" target="_blank" rel="noopener noreferrer">${escapeHTML(project.sourceLabel || 'Original IAAC project')} <span aria-hidden="true">↗</span></a>` : '';
 const downloadLink = project.download ? `<a class="text-link" href="${escapeHTML(assetURL(project.download))}" download="${escapeHTML(project.downloadName || 'so101-kinematics.zip')}">${escapeHTML(project.downloadLabel || 'Download study + code')} <span aria-hidden="true">↓</span></a>` : '';
 $('#project-content').innerHTML = caseStudyHTML(project, sourceLink, downloadLink, next, index);
 if (!dialog.open) dialog.showModal();
 document.body.classList.add('modal-open');
 dialog.scrollTop = 0;
 $('#dialog-close').focus({preventScroll:true});
 document.title = `${project.title} | Chi Lee`;
 if (setHash) history.replaceState(null, '', `#project/${encodeURIComponent(id)}`);
}
function closeProject(updateHash = true) {
 if (!dialog.open) return;
 pauseProjectVideos();
 dialog.close();
 document.body.classList.remove('modal-open');
 activeProjectId = null;
 document.title = 'Chi Lee | Matter in Motion';
 if (updateHash) history.replaceState(null, '', previousHash);
 if (returnFocus && returnFocus.isConnected) returnFocus.focus({preventScroll:true});
}
function adjacentProject(offset) {
 const index = projects.findIndex(project => project.id === activeProjectId);
 openProject(projects[(index + offset + projects.length) % projects.length].id);
}

const viewer = $('#image-viewer');
const viewerImage = $('#viewer-image');
const viewerStage = $('#viewer-stage');
let imageReturnFocus = null;
let zoomed = false;
function setImageZoom(value) {
 zoomed = value;
 const fittedWidth = Math.max(1, Math.min(viewerStage.clientWidth - 32, viewerImage.naturalWidth, (viewerStage.clientHeight - 32) * viewerImage.naturalWidth / viewerImage.naturalHeight));
 viewerStage.style.setProperty('--zoom-width', Math.max(viewerImage.naturalWidth, fittedWidth * 2) + 'px');
 viewerStage.classList.toggle('is-zoomed', value);
 $('#viewer-zoom').setAttribute('aria-pressed', String(value));
 $('#viewer-zoom').textContent = value ? 'Fit image' : 'Zoom in';
 if (!value) {viewerStage.scrollTop=0;viewerStage.scrollLeft=0;}
}
function openImage(file, caption) {
 imageReturnFocus = document.activeElement;
 viewerImage.src=assetURL(file);viewerImage.alt=caption;$('#viewer-caption').textContent=caption;
 $('#viewer-original').href=assetURL(file);
 setImageZoom(false);viewer.showModal();document.body.classList.add('modal-open');
 $('#viewer-close').focus();
}
function closeImage() {
 viewer.close();setImageZoom(false);
 if (!dialog.open) document.body.classList.remove('modal-open');
 if (imageReturnFocus && imageReturnFocus.isConnected) imageReturnFocus.focus({preventScroll:true});
}
$('#viewer-zoom').addEventListener('click', () => setImageZoom(!zoomed));
viewerImage.addEventListener('click', () => setImageZoom(!zoomed));
$('#viewer-close').addEventListener('click', closeImage);
viewer.addEventListener('cancel', event => {event.preventDefault();closeImage();});
viewer.addEventListener('keydown', event => {
 if (event.key==='+' || event.key==='=') {event.preventDefault();setImageZoom(true);}
 if (event.key==='-' || event.key==='0') {event.preventDefault();setImageZoom(false);}
});
document.addEventListener('click', event => {const trigger=event.target.closest('[data-image]');if(trigger) openImage(trigger.dataset.image,trigger.dataset.caption || '');});
$('#featured-grid').innerHTML = projects.filter(project => project.featured).map(card).join('');
renderArchive();
document.addEventListener('click', event => {
 const chapterTrigger = event.target.closest('[data-case-jump]');
 if (chapterTrigger) { const target=document.getElementById(chapterTrigger.dataset.caseJump); if(target){target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}); target.focus({preventScroll:true});} }
 const projectTrigger = event.target.closest('[data-project]');
 if (projectTrigger) openProject(projectTrigger.dataset.project);
 const filterTrigger = event.target.closest('[data-filter]');
 if (filterTrigger) {
  selectedFilter = filterTrigger.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === filterTrigger)));
  renderArchive();
 }
});
$('#project-search').addEventListener('input', renderArchive);
$('#dialog-close').addEventListener('click', () => closeProject());
dialog.addEventListener('cancel', event => { event.preventDefault(); closeProject(); });
$('#project-prev').addEventListener('click', () => adjacentProject(-1));
$('#project-next').addEventListener('click', () => adjacentProject(1));
dialog.addEventListener('keydown', event => {
 if (event.target.matches('input,textarea,select')) return;
 if (event.key === 'ArrowRight') {event.preventDefault(); adjacentProject(1);}
 if (event.key === 'ArrowLeft') {event.preventDefault(); adjacentProject(-1);}
});
function syncHash() {
 if (location.hash.startsWith('#project/')) {
  const id = decodeURIComponent(location.hash.replace('#project/', ''));
  if (projects.some(project => project.id === id)) openProject(id, false);
 } else closeProject(false);
}
window.addEventListener('hashchange', syncHash);
syncHash();
function updateClock() {
 try {
  const time = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/Madrid',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
  $('#local-clock').textContent = `BCN ${time} / LOCAL TIME`;
 } catch (_) { $('#local-clock').textContent = 'COMPUTATIONAL / PHYSICAL'; }
}
updateClock();
setInterval(updateClock, 30000);
})();
