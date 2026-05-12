/* script.js — MindDiagnose Assessment Logic
   Vanilla JS: Smart fuzzy search, pill management, API call, result render.
*/

const MIN_CHARS = 4;
const MIN_SELECTED = 3;
const API_SYMPTOMS = '/api/symptoms/all';
const API_DIAGNOSE = '/api/diagnose';

// ── State ─────────────────────────────────────────────────────────────────────
let allSymptoms = [];       // [{code, name, category, description}]
let selectedSymptoms = [];  // [{code, name}]

// ── DOM refs ──────────────────────────────────────────────────────────────────
const searchInput    = document.getElementById('searchInput');
const searchClear    = document.getElementById('searchClear');
const searchHint     = document.getElementById('searchHint');
const dropdown       = document.getElementById('searchDropdown');
const pillsEmpty     = document.getElementById('pillsEmpty');
const pillsContainer = document.getElementById('pillsContainer');
const selectedCount  = document.getElementById('selectedCount');
const validationMsg  = document.getElementById('validationMsg');
const submitBtn      = document.getElementById('submitBtn');
const retryBtn       = document.getElementById('retryBtn');

const viewForm    = document.getElementById('view-form');
const viewLoading = document.getElementById('view-loading');
const viewResult  = document.getElementById('view-result');

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch(API_SYMPTOMS);
    const json = await res.json();
    allSymptoms = json.data || [];
  } catch (e) {
    console.error('Gagal memuat data gejala:', e);
  }
}

// ── Fuzzy search (simple) ─────────────────────────────────────────────────────
function fuzzyMatch(text, query) {
  text = text.toLowerCase();
  query = query.toLowerCase();
  // Simple substring first
  if (text.includes(query)) return true;
  // Fuzzy: check if all chars of query appear in order in text
  let qi = 0;
  for (let i = 0; i < text.length && qi < query.length; i++) {
    if (text[i] === query[qi]) qi++;
  }
  return qi === query.length;
}

function searchSymptoms(query) {
  const selected_codes = new Set(selectedSymptoms.map(s => s.code));
  return allSymptoms
    .filter(s => !selected_codes.has(s.code))
    .filter(s => fuzzyMatch(s.name, query) || (s.description && fuzzyMatch(s.description, query)))
    .slice(0, 8);
}

// ── Search input handler ──────────────────────────────────────────────────────
searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim();

  if (q.length === 0) {
    searchClear.classList.add('hidden');
    searchHint.classList.add('hidden');
    hideDropdown();
    return;
  }

  searchClear.classList.remove('hidden');

  if (q.length < MIN_CHARS) {
    searchHint.textContent = `Ketik ${MIN_CHARS - q.length} karakter lagi untuk memulai pencarian`;
    searchHint.classList.remove('hidden');
    hideDropdown();
    return;
  }

  searchHint.classList.add('hidden');
  const results = searchSymptoms(q);
  renderDropdown(results);
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') hideDropdown();
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.classList.add('hidden');
  searchHint.classList.add('hidden');
  hideDropdown();
  searchInput.focus();
});

// Close dropdown on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrapper') && !e.target.closest('.dropdown')) {
    hideDropdown();
  }
});

// ── Dropdown ──────────────────────────────────────────────────────────────────
function renderDropdown(symptoms) {
  if (symptoms.length === 0) { hideDropdown(); return; }

  dropdown.innerHTML = symptoms.map(s => `
    <button class="dropdown-item" data-code="${s.code}" data-name="${escHtml(s.name)}">
      <span class="dropdown-item-name">${highlight(s.name, searchInput.value)}</span>
      ${s.description ? `<span class="dropdown-item-desc">${escHtml(s.description)}</span>` : ''}
    </button>
  `).join('');

  dropdown.querySelectorAll('.dropdown-item').forEach(btn => {
    btn.addEventListener('mousedown', e => {
      e.preventDefault();
      selectSymptom({ code: btn.dataset.code, name: btn.dataset.name });
    });
  });

  dropdown.classList.remove('hidden');
}

function hideDropdown() {
  dropdown.classList.add('hidden');
  dropdown.innerHTML = '';
}

function highlight(text, query) {
  if (!query) return escHtml(text);
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return escHtml(text);
  return escHtml(text.slice(0, idx))
    + `<mark style="background:rgba(13,148,136,0.15);color:#0f766e;border-radius:3px;">${escHtml(text.slice(idx, idx + query.length))}</mark>`
    + escHtml(text.slice(idx + query.length));
}

function escHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// ── Selection ─────────────────────────────────────────────────────────────────
function selectSymptom(symptom) {
  if (selectedSymptoms.find(s => s.code === symptom.code)) return;
  selectedSymptoms.push(symptom);
  searchInput.value = '';
  searchClear.classList.add('hidden');
  searchHint.classList.add('hidden');
  hideDropdown();
  searchInput.focus();
  renderPills();
  updateSubmitState();
}

function removeSymptom(code) {
  selectedSymptoms = selectedSymptoms.filter(s => s.code !== code);
  renderPills();
  updateSubmitState();
}

function renderPills() {
  const count = selectedSymptoms.length;
  selectedCount.textContent = `${count} / min. ${MIN_SELECTED}`;

  if (count >= MIN_SELECTED) {
    selectedCount.classList.add('ready');
  } else {
    selectedCount.classList.remove('ready');
  }

  if (count === 0) {
    pillsEmpty.classList.remove('hidden');
    pillsContainer.classList.add('hidden');
    pillsContainer.innerHTML = '';
    return;
  }

  pillsEmpty.classList.add('hidden');
  pillsContainer.classList.remove('hidden');
  pillsContainer.innerHTML = selectedSymptoms.map(s => `
    <span class="pill">
      ${escHtml(s.name)}
      <button class="pill-remove" data-code="${s.code}" aria-label="Hapus ${escHtml(s.name)}">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
      </button>
    </span>
  `).join('');

  pillsContainer.querySelectorAll('.pill-remove').forEach(btn => {
    btn.addEventListener('click', () => removeSymptom(btn.dataset.code));
  });
}

function updateSubmitState() {
  const count = selectedSymptoms.length;
  submitBtn.disabled = count < MIN_SELECTED;

  if (count > 0 && count < MIN_SELECTED) {
    validationMsg.textContent = `Tambahkan ${MIN_SELECTED - count} gejala lagi untuk mengaktifkan diagnosa.`;
    validationMsg.classList.remove('hidden');
  } else {
    validationMsg.classList.add('hidden');
  }
}

// ── Submit ─────────────────────────────────────────────────────────────────────
submitBtn.addEventListener('click', async () => {
  if (selectedSymptoms.length < MIN_SELECTED) return;

  // Show loading
  viewForm.classList.add('hidden');
  viewLoading.classList.remove('hidden');

  try {
    const res = await fetch(API_DIAGNOSE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symptom_codes: selectedSymptoms.map(s => s.code) })
    });
    const json = await res.json();

    if (json.status !== 'success') throw new Error(json.message || 'Server error');

    viewLoading.classList.add('hidden');
    renderResults(json.data);
    viewResult.classList.remove('hidden');

    document.getElementById('resultMeta').textContent =
      `${json.data.total_analyzed} kondisi dianalisis · ${json.data.symptoms_selected} gejala dipilih`;

  } catch (err) {
    viewLoading.classList.add('hidden');
    viewForm.classList.remove('hidden');
    alert('Terjadi kesalahan: ' + err.message);
  }
});

retryBtn.addEventListener('click', () => {
  selectedSymptoms = [];
  renderPills();
  updateSubmitState();
  viewResult.classList.add('hidden');
  viewForm.classList.remove('hidden');
});

// ── Render Results ────────────────────────────────────────────────────────────
function renderResults(data) {
  const results = data.results || [];
  const resultCard = document.getElementById('resultCard');
  const otherResults = document.getElementById('otherResults');

  if (results.length === 0 || !results[0].is_above_threshold) {
    // No positive result
    resultCard.innerHTML = `
      <div class="result-negative">
        <div class="negative-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2>Tidak Terindikasi</h2>
        <p>Berdasarkan gejala yang Anda laporkan, tidak ada kondisi yang melampaui ambang batas diagnosis yang ditetapkan.</p>
      </div>`;
    otherResults.innerHTML = '';
    return;
  }

  const top = results[0];

  // Animate score bar (need to set width after paint)
  resultCard.innerHTML = `
    <div class="result-header">
      <p class="eyebrow">Kondisi Terindikasi</p>
      <h2>${escHtml(top.disease.name)}</h2>
      <p class="disease-code">Kode Diagnosa: ${escHtml(top.disease.code)}</p>
    </div>
    <div class="result-body">
      <div>
        <div class="score-label">
          <span>Tingkat Keyakinan (Confidence Score)</span>
          <strong>${top.score_percentage}%</strong>
        </div>
        <div class="score-track">
          <div class="score-fill" id="scoreFill" style="width: 0%"></div>
          <div class="threshold-marker" style="left: ${Math.min(top.disease.threshold, 99)}%"
               title="Ambang Minimum: ${top.disease.threshold}%"></div>
        </div>
        <div class="score-axis">
          <span>0%</span>
          <span class="threshold-label">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            Ambang Min. ${top.disease.threshold}%
          </span>
          <span>100%</span>
        </div>
      </div>

      ${top.matched_symptoms.length > 0 ? `
        <div class="symptoms-section">
          <h3>Gejala yang Berkontribusi (${top.matched_symptoms.length})</h3>
          ${top.matched_symptoms.map(s => `
            <div class="symptom-row">
              <span class="symptom-row-name">${escHtml(s.name)}</span>
              <div class="symptom-row-meta">
                <span class="tag">${escHtml(s.type)}</span>
                <span class="weight">Bobot: ${s.weight}</span>
              </div>
            </div>`).join('')}
        </div>` : ''}
    </div>`;

  // Animate bar
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const fill = document.getElementById('scoreFill');
      if (fill) fill.style.width = `${Math.min(top.score_percentage, 100)}%`;
    });
  });

  // Other results
  const others = results.slice(1, 5);
  if (others.length > 0) {
    otherResults.innerHTML = `
      <div class="other-results-section">
        <h3>Hasil Lainnya</h3>
        ${others.map(r => `
          <div class="other-row">
            <span class="other-name">${escHtml(r.disease.name)}</span>
            <div class="other-track">
              <div class="other-fill" style="width:${Math.min(r.score_percentage,100)}%; background:${r.is_above_threshold ? '#f59e0b' : '#cbd5e1'}"></div>
            </div>
            <span class="other-score" style="color:${r.is_above_threshold ? '#d97706' : '#94a3b8'}">${r.score_percentage}%</span>
          </div>`).join('')}
      </div>`;
  } else {
    otherResults.innerHTML = '';
  }
}

// ── Start ──────────────────────────────────────────────────────────────────────
init();
