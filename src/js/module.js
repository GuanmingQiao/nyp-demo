async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch { return {}; }
}

function getWeekParam() {
  return parseInt(new URLSearchParams(location.search).get('week')) || 1;
}

function render(mod, currentWeek) {
  document.title = `Week ${mod.week}: ${mod.name} — IT3226`;

  document.getElementById('module-hero').setAttribute('data-week', String(mod.week).padStart(2, '0'));
  document.getElementById('breadcrumb-label').textContent = `Week ${mod.week}`;
  document.getElementById('week-pill').textContent = `Week ${mod.week}`;
  document.getElementById('study-hours').textContent = `${mod.studyHours} hrs self-study`;
  document.getElementById('module-title').textContent = mod.name;
  document.getElementById('module-overview').textContent = mod.overview;

  if (mod.week === currentWeek) {
    const pill = document.getElementById('week-pill');
    pill.textContent = `Week ${mod.week} — Current`;
    pill.style.background = 'rgba(247,148,29,0.3)';
  }

  const objList = document.getElementById('objective-list');
  objList.innerHTML = mod.objectives.map(o => `<li>${o}</li>`).join('');

  const topicGrid = document.getElementById('topic-grid');
  topicGrid.innerHTML = mod.topics.map(t => `
    <div class="topic-card">
      <div class="topic-name">${t.name}</div>
      <div class="topic-detail">${t.detail}</div>
    </div>`).join('');

  const prev = MODULES.find(m => m.week === mod.week - 1);
  const next = MODULES.find(m => m.week === mod.week + 1);
  const nav  = document.getElementById('week-nav');
  nav.innerHTML = `
    ${prev ? `<a href="/module.html?week=${prev.week}">← Week ${prev.week}: ${prev.name}</a>` : '<span></span>'}
    <a class="nav-back" href="/">Back to Syllabus</a>
    ${next ? `<a href="/module.html?week=${next.week}">Week ${next.week}: ${next.name} →</a>` : '<span></span>'}`;
}

function applyConfigToBanner(config) {
  if (config.announcement) {
    document.getElementById('banner-text').textContent = config.announcement;
    document.getElementById('banner').removeAttribute('hidden');
  }
}

const week = getWeekParam();
const mod  = MODULES.find(m => m.week === week) || MODULES[0];

loadConfig().then(config => {
  applyConfigToBanner(config);
  render(mod, Number(config.currentWeek) || 0);
});
