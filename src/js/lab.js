async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch { return {}; }
}

function getIdParam() {
  return parseInt(new URLSearchParams(location.search).get('id')) || 1;
}

function render(lab) {
  document.title = `Lab ${lab.id}: ${lab.title} — IT3226`;

  document.getElementById('lab-hero').setAttribute('data-lab', String(lab.id).padStart(2, '0'));
  document.getElementById('breadcrumb-label').textContent = `Lab ${lab.id}`;
  document.getElementById('lab-num-pill').textContent = `Lab ${lab.id}`;

  const diffBadge = document.getElementById('difficulty-badge');
  diffBadge.textContent = lab.difficulty;
  diffBadge.className = `difficulty-badge ${lab.difficulty.toLowerCase()}`;

  document.getElementById('duration-badge').textContent = `⏱ ${lab.duration}`;
  document.getElementById('lab-title').textContent = lab.title;
  document.getElementById('lab-overview').textContent = lab.overview;

  const servicesEl = document.getElementById('lab-services');
  servicesEl.innerHTML = lab.services.map(s => `<span class="service-tag">${s}</span>`).join('');

  const prereqWeekLinks = lab.prerequisiteWeeks.map(w => {
    const mod = MODULES.find(m => m.week === w);
    return mod ? `<a href="/module.html?week=${w}">Week ${w}: ${mod.name}</a>` : `Week ${w}`;
  }).join(', ');
  document.getElementById('prereq-text').innerHTML = `Complete before attempting this lab: ${prereqWeekLinks}.`;

  const stepList = document.getElementById('step-list');
  stepList.innerHTML = lab.steps.map((step, i) => `
    <div class="step-item" onclick="toggleStep(this)">
      <div class="step-num">${i + 1}</div>
      <div class="step-content">
        <p class="step-title">${step.title}</p>
        <div class="step-detail">${step.detail}</div>
      </div>
      <div class="step-chevron">⌄</div>
    </div>`).join('');

  document.getElementById('download-btn').textContent = `Download Lab ${lab.id} Handout (PDF)`;

  const prev = LABS.find(l => l.id === lab.id - 1);
  const next = LABS.find(l => l.id === lab.id + 1);
  const nav  = document.getElementById('lab-nav');
  nav.innerHTML = `
    ${prev ? `<a href="/lab.html?id=${prev.id}">← Lab ${prev.id}: ${prev.title}</a>` : '<span></span>'}
    <a class="nav-back" href="/">Back to Syllabus</a>
    ${next ? `<a href="/lab.html?id=${next.id}">Lab ${next.id}: ${next.title} →</a>` : '<span></span>'}`;
}

function toggleStep(el) {
  const detail  = el.querySelector('.step-detail');
  const isOpen  = detail.classList.contains('open');
  el.classList.toggle('expanded', !isOpen);
  detail.classList.toggle('open', !isOpen);
}

function applyConfigToBanner(config) {
  if (config.announcement) {
    document.getElementById('banner-text').textContent = config.announcement;
    document.getElementById('banner').removeAttribute('hidden');
  }
}

const id  = getIdParam();
const lab = LABS.find(l => l.id === id) || LABS[0];

loadConfig().then(config => {
  applyConfigToBanner(config);
  render(lab);
});
