async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return {};
  }
}

function applyConfig(config) {
  const banner = document.getElementById('banner');
  if (config.announcement) {
    document.getElementById('banner-text').textContent = config.announcement;
    banner.removeAttribute('hidden');
  }

  const env = config.environment || 'local';
  const badge = document.getElementById('env-badge');
  if (badge) { badge.textContent = env; badge.className = `env-badge ${env}`; }

  const semEl = document.getElementById('semester');
  if (semEl && config.semester) semEl.textContent = config.semester;

  const deployInfo = document.getElementById('deploy-info');
  if (deployInfo) {
    const parts = [];
    if (config.deployedAt) parts.push(`Deployed ${new Date(config.deployedAt).toLocaleString('en-SG', { timeZone: 'Asia/Singapore' })}`);
    if (config.commitSha)  parts.push(`@ ${config.commitSha.slice(0, 7)}`);
    if (parts.length) deployInfo.textContent = parts.join(' ');
  }

  const currentWeek = Number(config.currentWeek) || 0;
  renderSchedule(currentWeek);
  renderLabList();
}

function renderSchedule(currentWeek) {
  const table = document.getElementById('schedule-table');
  if (!table) return;

  const labWeekMap = {};
  LABS.forEach(lab => {
    const lastPrereq = lab.prerequisiteWeeks[lab.prerequisiteWeeks.length - 1];
    if (!labWeekMap[lastPrereq]) labWeekMap[lastPrereq] = [];
    labWeekMap[lastPrereq].push(lab);
  });

  table.innerHTML = `
    <thead>
      <tr>
        <th style="width:70px">Week</th>
        <th>Topic</th>
        <th style="width:120px">Study Hours</th>
        <th style="width:160px">Lab</th>
      </tr>
    </thead>
    <tbody>
      ${MODULES.map(m => {
        const isCurrent = m.week === currentWeek;
        const labsThisWeek = labWeekMap[m.week] || [];
        const labLinks = labsThisWeek.map(l =>
          `<a class="lab-tag" href="/lab.html?id=${l.id}">Lab ${l.id}</a>`
        ).join(' ');

        return `
          <tr class="${isCurrent ? 'current-row' : ''}" onclick="location.href='/module.html?week=${m.week}'" style="cursor:pointer">
            <td class="week-cell">Week ${m.week}${isCurrent ? '<span class="current-tag">Now</span>' : ''}</td>
            <td>
              <a class="topic-link" href="/module.html?week=${m.week}">${m.name}</a>
              <div class="topic-desc">${m.desc}</div>
            </td>
            <td style="font-size:13px;color:var(--text-muted)">${m.studyHours} hrs self-study</td>
            <td>${labLinks}</td>
          </tr>`;
      }).join('')}
    </tbody>`;
}

function renderLabList() {
  const list = document.getElementById('lab-list');
  if (!list) return;

  list.innerHTML = LABS.map(lab => `
    <a class="lab-row" href="/lab.html?id=${lab.id}">
      <span class="lab-row-num">Lab ${lab.id}</span>
      <span>
        <div class="lab-row-name">${lab.title}</div>
        <div class="lab-row-desc">${lab.shortDesc}</div>
      </span>
      <span class="lab-row-duration">${lab.duration}</span>
      <span class="lab-row-arrow">›</span>
    </a>`).join('');
}

loadConfig().then(applyConfig);
