(() => {
'use strict';
const projects = (window.PORTFOLIO_PROJECTS || []).filter(project => !project.hidden);
const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const number = (n) => String(n).padStart(2, '0');
const dialog = $('#project-dialog');
let selectedFilter = 'All';
const ROBOTICS_PATH=['terraweave','scan-to-print','cork-reform','fan-only','balloon-tool'];
const ROBOTICS_NOTES={
 'terraweave':['Team project with Elizabeth Frias and Krystyne Kontos: design development, Grasshopper-based robot toolpath programming, prototype fabrication and project film.','Turning design intent into ABB robot motion, then iterating with real material.'],
 'anomaly-detection':['Team project: operated the robot, processed LiDAR point clouds and analysed roof anomalies.','Sensing and model-to-reality checks, the core of deploying a robot on site.'],
 'scan-to-print':['Team member in a UR10e depth-camera scanning to non-planar 3D-printing toolpath workflow (Grasshopper / ROS / Python).','Closing the loop from scanning a real object to generating robot toolpaths.'],
 'sculpta':['Individual thesis: parametric design, full-scale PETG FDM prototyping and design revision after testing.','A design–print–test–revise loop, the same habit used in commissioning.'],
 'so101':['Personal study, AI-assisted, simulation only: kinematic simulation, path comparison and workspace study.','Understanding how robot motion planning behaves before running hardware.']
};
const GLANCE_ICONS={
 robot:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21h8M8 21v-4l3-5 5 2M11 12l2-6 5 1"/><circle cx="8" cy="17" r="1.6"/><circle cx="11" cy="12" r="1.4"/><path d="M18 7l2 2m-2-2l1.5-2"/></svg>',
 flow:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="6" height="8" rx="1"/><rect x="15" y="6" width="6" height="12" rx="1"/><path d="M10 12h4m-2-2l2 2-2 2"/></svg>',
 tools:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M4 12h16M4 17h7"/><circle cx="17" cy="7" r="2"/><circle cx="14" cy="17" r="2"/></svg>',
 team:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M3 20c.5-3.5 3-5 6-5s5.5 1.5 6 5M15 15.5c2.6 0 4.8 1.4 5.2 4.5"/></svg>',
 print:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16M12 4v6"/><path d="M10 10h4l-1 3h-2z"/><path d="M6 20h12M7 17h10M8 14.5h8"/></svg>',
 scan:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/><path d="M7 12h10"/><circle cx="9" cy="9" r=".8"/><circle cx="14" cy="10" r=".8"/><circle cx="11" cy="15" r=".8"/><circle cx="16" cy="14" r=".8"/></svg>'
};
const GLANCE={
 'terraweave':{facts:[['robot','Robot','ABB industrial arm'],['flow','Input → output','Woven willow + earth → wall module'],['tools','Tools','Grasshopper · teach pendant · earth pump'],['team','Team','3 students · IAAC MRAC Studio III']],
  steps:[['assets/ig/Dfpfco3lDQ6_06.jpg','Weave a willow scaffold'],['assets/ig/DfRPAvbFeHa_03.jpg','Plan toolpaths in Grasshopper'],['assets/ig/DfRPAvbFeHa_04.jpg','Calibrate the robot'],['assets/ig/DfXkaHzlCWN_02.jpg','Inject earth into the weave'],['assets/ig/DfXkaHzlCWN_13.jpg','Finished prototype']]},
 'anomaly-detection':{facts:[['robot','Robot','Husky A200 mobile robot'],['scan','Sensor','LiDAR point clouds'],['flow','Input → output','Building scan → roof-opening map'],['team','Team','4 students · IAAC MRAC']],
  steps:[['assets/an_hw.jpg','Compare scanning hardware'],['assets/an_cloud.jpg','Scan the building'],['assets/an_data.jpg','Extract roof geometry'],['assets/an_holes.jpg','Locate roof openings']]},
 'scan-to-print':{facts:[['robot','Robot','UR10e + depth camera'],['flow','Input → output','Physical model → curved print toolpaths'],['tools','Tools','Grasshopper · ROS · Python'],['team','Team','3 students · IAAC MRAC']],
  steps:[['assets/scan_robot.jpg','Scan the object with the robot'],['assets/ig/Dbv-m5hFCco_03.jpg','Automate the scan in ROS'],['assets/scan06.jpg','Rebuild it as print toolpaths']]},
 'sculpta':{facts:[['print','Fabrication','PETG FDM 3D printing'],['flow','Input → output','Algae façade needs → printable unit'],['tools','Tools','Rhino · Grasshopper'],['team','Role','Individual master’s thesis · UPC']],
  steps:[['assets/sculpta-slide-why-s-unit.jpg','Shape the S-unit'],['assets/sculpta-slide-final-unit.jpg','Detail the final unit'],['assets/sculpta-slide-print-revision.jpg','Print, break, revise to 1.2 mm'],['assets/sculpta-slide-unit-to-field.jpg','Assemble a field prototype'],['assets/sculpta-slide-barrel-vault.jpg','Apply at architectural scale']]},
 'so101':{facts:[['robot','Robot','SO-101 6-motor arm (model)'],['flow','Input → output','URDF model → path & workspace tests'],['tools','Tools','Python · forward / inverse kinematics'],['team','Status','Personal study · simulation only']],
  steps:[['assets/so101-scenario_lateral.png','Compare two path types'],['assets/so101-workspace.png','Map the reachable space'],['assets/so101-scenario_lift_fail.png','Keep the failure cases']]}
};
function roboticsNoteHTML(id){
 const n=ROBOTICS_NOTES[id],g=GLANCE[id];if(!n)return '';
 const project=projects.find(p=>p.id===id)||{images:[]};
 const facts=g?'<div class="glance-facts">'+g.facts.map(([ic,label,val])=>'<div class="glance-fact"><span class="glance-icon">'+(GLANCE_ICONS[ic]||'')+'</span><div><span class="mono">'+escapeHTML(label)+'</span><strong>'+escapeHTML(val)+'</strong></div></div>').join('')+'</div>':'';
 const steps=g?'<ol class="glance-steps" style="--n:'+g.steps.length+'">'+g.steps.map(([file,text],i)=>{const im=project.images.find(x=>x.file===file);const cap=im?im.caption:text;return '<li><button class="image-open glance-thumb" type="button" data-image="'+escapeHTML(file)+'" data-caption="'+escapeHTML(cap)+'" aria-label="View full image: '+escapeHTML(text)+'"><img src="'+escapeHTML(assetURL(file))+'" alt="'+escapeHTML(text)+'" loading="lazy" decoding="async"></button><span class="mono">'+number(i+1)+'</span><p>'+escapeHTML(text)+'</p></li>';}).join('')+'</ol>':'';
 return '<section class="glance" aria-label="Project at a glance"><div class="glance-head"><span class="mono">AT A GLANCE</span></div>'+facts+'<div class="robotics-note"><p><span class="mono">MY ROLE</span>'+escapeHTML(n[0])+'</p><p><span class="mono">WHY IT MATTERS</span>'+escapeHTML(n[1])+'</p></div>'+(steps?'<div class="glance-head"><span class="mono">HOW IT WORKS</span></div>'+steps:'')+'</section>';
}
let activeProjectId = null;
let returnFocus = null;
let previousHash = '#work';
function card(project) {
 const index = projects.indexOf(project) + 1;
 const cover = project.images[0];
 return `<button class="project-card" type="button" data-project="${escapeHTML(project.id)}" aria-label="Open ${escapeHTML(project.title)}: ${escapeHTML(project.kind)}"><div class="card-media"><img src="${escapeHTML(assetURL(cover.file))}" alt="${escapeHTML(cover.caption)}" loading="lazy" decoding="async" width="900" height="650"><span class="card-index">${number(index)} / ${escapeHTML(project.category.toUpperCase())}</span><span class="card-open" aria-hidden="true">↗</span></div><div class="card-meta"><span>${escapeHTML(project.year)} / ${escapeHTML(project.kind)}</span><span>${escapeHTML(project.category)}</span></div><h3 class="card-title">${escapeHTML(project.title)}</h3><p class="card-description">${escapeHTML(project.summary)}</p><div class="card-tags">${(project.tools||[]).slice(0,3).map(t=>`<span>${escapeHTML(t)}</span>`).join('')}</div></button>`;
}
function renderArchive() {
 const query = $('#project-search').value.trim().toLowerCase();
 const matchesQuery = project => [project.title,project.subtitle,project.summary,project.institution,project.kind,project.year,...project.tools].join(' ').toLowerCase().includes(query);
 const visible = selectedFilter === 'RoboticsPath' ? ROBOTICS_PATH.map(id => projects.find(project => project.id === id)).filter(project => project && matchesQuery(project)) : projects.filter(project => (selectedFilter === 'All' || project.category === selectedFilter) && matchesQuery(project));
 $('#archive-grid').innerHTML = visible.map(card).join('');
 $('#result-count').textContent = `${number(visible.length)} / ${projects.length} PROJECTS`;
 $('#empty-state').hidden = visible.length > 0;
}
function figure(image, cover = false) {
 const media = image.loop ? `<video class="loop-figure" src="${escapeHTML(assetURL(image.loop))}" poster="${escapeHTML(assetURL(image.file))}" autoplay muted loop playsinline preload="metadata" aria-label="${escapeHTML(image.caption)}"></video>` : `<img src="${escapeHTML(assetURL(image.file))}" alt="${escapeHTML(image.caption)}" loading="${cover ? 'eager' : 'lazy'}" decoding="async">`;
 return `<figure${cover ? ' class="case-cover"' : ''}><button class="image-open" type="button" data-image="${escapeHTML(image.file)}" data-caption="${escapeHTML(image.caption)}" aria-label="View full image: ${escapeHTML(image.caption)}">${media}<span class="image-open-label">${image.loop ? 'ANIMATED · VIEW FRAME +' : 'VIEW FULL IMAGE +'}</span></button><figcaption>${escapeHTML(image.caption)}</figcaption></figure>`;
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
 const grid = files => '<div class="sc-slides">'+files.map(f=>image(f)).join('')+'</div>';
 return '<div class="sc-clean">'+
 '<header class="case-header sc-header"><div class="case-meta"><span class="scope-badge">Individual thesis</span><span>'+escapeHTML(project.year)+'</span><span>MADE · ETSAV–UPC</span></div><h2 id="dialog-title">SCULPTA</h2><p class="case-subtitle">'+escapeHTML(project.subtitle)+'</p></header>'+
 '<nav class="case-chapters" aria-label="Case-study sections">'+chapters.map(([id,label])=>'<button type="button" data-case-jump="'+id+'">'+label+'</button>').join('')+'</nav>'+roboticsNoteHTML('sculpta')+
 '<section class="sc-film" id="case-films" tabindex="-1" aria-label="SCULPTA project film"><video controls playsinline preload="metadata" poster="'+escapeHTML(assetURL(film.poster))+'" aria-label="'+escapeHTML(film.label)+'"><source src="'+escapeHTML(assetURL(film.src))+'" type="video/mp4">Your browser cannot play this film.</video><div class="sc-film-caption"><span>PROJECT FILM / 74.5 SEC</span><a href="'+escapeHTML(assetURL(film.src))+'" target="_blank" rel="noopener">Open film ↗</a></div></section>'+
 '<section class="sc-block sc-overview" id="case-overview" tabindex="-1"><div><span class="sc-kicker">01 / THE IDEA</span><h3>A living skin.<br>Designed for care.</h3></div><div><p class="sc-lead">A façade of 3D-printed PETG vessels for microalgae. Each unit is designed to be printed, connected and replaced.</p><p class="sc-small">Individual master’s thesis · computational design, prototyping · PETG FDM</p></div></section>'+
 '<section class="sc-block" id="case-design" tabindex="-1"><div class="sc-section-heading"><span class="sc-kicker">02 / DESIGN</span><h3>From one unit to a field.</h3></div>'+grid(['assets/sculpta-slide-why-s-unit.jpg','assets/sculpta-slide-final-unit.jpg','assets/sculpta-slide-aggregation.jpg','assets/sculpta-slide-join.jpg'])+'</section>'+
 '<section class="sc-block" id="case-prototype" tabindex="-1"><div class="sc-section-heading"><span class="sc-kicker">03 / PROTOTYPE</span><h3>Print. Observe. Revise.</h3></div>'+grid(['assets/sculpta-slide-print-revision.jpg','assets/sculpta-slide-unit-to-field.jpg','assets/sculpta-prototype-front.jpg','assets/sculpta-prototype-edge.jpg'])+'</section>'+
 '<section class="sc-block" id="case-application" tabindex="-1"><div class="sc-section-heading"><span class="sc-kicker">04 / APPLICATION</span><h3>From component to architecture.</h3></div>'+image('assets/sculpta-system-render.jpg')+grid(['assets/sculpta-slide-barrel-vault.jpg','assets/sculpta-slide-arch54-landscape.jpg','assets/sculpta-slide-structural-check.jpg'])+'<p class="sc-small sc-limit">Not yet validated: watertightness, cultivation, thermal performance.</p></section>'+
 '<section class="sc-block sc-credits" id="case-credits" tabindex="-1"><details><summary>Documentation & credits <span>+</span></summary><div class="sc-documentation"><p>'+escapeHTML(project.team)+'</p><p>'+escapeHTML(project.mediaCredit)+'</p><div class="case-links">'+downloadLink+'</div></div></details></section>'+
 '<footer class="case-bottom"><button type="button" data-project="'+escapeHTML(next.id)+'"><span>NEXT PROJECT / '+number(projects.indexOf(next)+1)+'</span>'+escapeHTML(next.title)+'</button><span aria-hidden="true">↗</span></footer></div>';
}

function iaacArticleHTML(project, sourceLink, downloadLink, next, index) {
 const parts=project.iaac.parts||[];
 const used=new Set();
 const isSub=t=>{const w=t.split(/\s+/).length;if(/^(Github|Team member)/i.test(t))return false;if(t.length<=80&&w<=12&&!/[.!?;,]$/.test(t))return true;return t.length<=60&&/[.:]$/.test(t)&&!/[.:!?]/.test(t.slice(0,-1));};
 const renderBlocks=blocks=>{let html='',buf=[];const flush=()=>{if(!buf.length)return;html+='<div class="ia-figs ia-n'+Math.min(buf.length,2)+'">'+buf.map(b=>{used.add(b.file);return figure({file:b.file,caption:b.caption||''});}).join('')+'</div>';buf=[];};for(const b of blocks){if(b.k==='img'){buf.push(b);if(buf.length===2)flush();continue;}flush();if(b.k==='h')html+='<h3 class="ia-h">'+escapeHTML(b.t)+'</h3>';else if(b.k==='p')html+=isSub(b.t)?'<h4 class="ia-sub">'+escapeHTML(b.t.replace(/[.:]$/,''))+'</h4>':'<p class="ia-p">'+escapeHTML(b.t)+'</p>';else if(b.k==='list')html+='<ul class="ia-list">'+b.items.map(i=>'<li>'+escapeHTML(i)+'</li>').join('')+'</ul>';else if(b.k==='quote')html+='<blockquote class="ia-quote">'+escapeHTML(b.t)+'</blockquote>';}flush();return html;};
 const story=parts.map((p,i)=>(p.title?'<div class="ia-chapter"><span class="mono">CHAPTER '+number(i+1)+'</span><h3>'+escapeHTML(p.title)+'</h3></div>':'')+renderBlocks(p.blocks)).join('');
 const cover=project.images[0];used.add(cover.file);
 const extra=project.images.filter(im=>!used.has(im.file));
 const films=(project.videos||[]).length>0;
 const nav=[[films?'case-films':null,'Film'],['case-story','Story'],[extra.length?'case-gallery':null,'More'],['case-credits','Credits']].filter(x=>x[0]).map(([id,l])=>'<button type="button" data-case-jump="'+id+'">'+l+'</button>').join('');
 const srcLinks=parts.map(p=>'<li><a href="'+escapeHTML(p.url)+'" target="_blank" rel="noopener noreferrer">'+escapeHTML(p.title||project.title)+' · IAAC project page ↗</a></li>').join('');
 return '<header class="case-header"><div class="case-meta"><span class="scope-badge">'+escapeHTML(project.kind)+'</span><span>'+escapeHTML(project.year)+'</span><span>'+escapeHTML(project.institution)+'</span></div><h2 id="dialog-title">'+escapeHTML(project.title)+'</h2><p class="case-subtitle">'+escapeHTML(project.subtitle)+'</p></header><nav class="case-chapters" aria-label="Case-study sections">'+nav+'</nav>'+roboticsNoteHTML(project.id)+figure(cover,true)+projectVideosHTML(project)+
 '<section class="ia-story" id="case-story" tabindex="-1"><div class="ia-story-head"><span class="mono">THE PROJECT · AS DOCUMENTED AT IAAC</span></div>'+story+'</section>'+
 (extra.length?'<section class="case-gallery-section" id="case-gallery" tabindex="-1"><div class="gallery-section-heading"><div><span class="mono">MORE FROM THE PROJECT</span><h3>Process &amp; prototype.</h3></div><p>Additional photos, films stills and animated boards.</p></div><div class="case-gallery">'+extra.map(im=>figure(im)).join('')+'</div></section>':'')+
 '<section class="case-section case-credits" id="case-credits" tabindex="-1"><div class="case-section-label"><span class="mono">CONTRIBUTION &amp; SOURCES</span><h3>Who did what.</h3></div><div class="case-section-content"><h4>'+(String(project.role||'').startsWith('My contribution')?'My contribution':'Contribution / team context')+'</h4><p>'+escapeHTML(project.role||'')+'</p><h4>Team</h4><p>'+escapeHTML(project.team||'')+'</p><h4>Text &amp; images</h4><p>Narrative, diagrams and photographs follow the team’s official IAAC project page'+(parts.length>1?'s':'')+'; additional photos and films are credited in their captions.</p><ul class="case-source-list">'+srcLinks+'</ul><div class="case-links">'+sourceLink+downloadLink+'</div></div></section>'+
 '<footer class="case-bottom"><button type="button" data-project="'+escapeHTML(next.id)+'"><span>NEXT PROJECT / '+number(((index+1)%projects.length)+1)+'</span>'+escapeHTML(next.title)+'</button><span aria-hidden="true">↗</span></footer>';
}

function caseStudyHTML(project, sourceLink, downloadLink, next, index) {
 if(project.layout==='iaac'&&project.iaac) return iaacArticleHTML(project, sourceLink, downloadLink, next, index);
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
 return '<header class="case-header"><div class="case-meta"><span class="scope-badge">'+escapeHTML(project.kind)+'</span><span>'+escapeHTML(project.year)+'</span><span>'+escapeHTML(project.institution)+'</span><span class="case-readtime">'+Math.max(2,Math.ceil(readingWords/180))+' MIN READ</span></div><h2 id="dialog-title">'+escapeHTML(project.title)+'</h2><p class="case-subtitle">'+escapeHTML(project.subtitle)+'</p></header><nav class="case-chapters" aria-label="Case-study sections">'+quickNav+'</nav>'+roboticsNoteHTML(project.id)+figure(project.images[0],true)+projectVideosHTML(project)+
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
function applyHashFilter() {
 if (location.hash === '#robotics') {
  const btn = document.querySelector('[data-filter="RoboticsPath"]');
  if (btn) { selectedFilter = 'RoboticsPath'; document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button === btn))); renderArchive(); const work = document.getElementById('work'); if (work) work.scrollIntoView({block:'start'}); }
 }
}
function syncHash() {
 applyHashFilter();
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
