const MIN_CHARS = 4;
const MIN_SELECTED = 3;

let semuaGejala = [];
let gejalaTerpilih = [];

// ambil elemen DOM
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
const viewForm       = document.getElementById('view-form');
const viewLoading    = document.getElementById('view-loading');
const viewResult     = document.getElementById('view-result');

// load semua gejala dari server waktu halaman dibuka
async function init() {
    try {
        const res = await fetch('/api/symptoms/all');
        const json = await res.json();
        semuaGejala = json.data || [];
    } catch (e) {
        console.error('Gagal memuat data gejala:', e);
    }
}

// cek apakah query cocok dengan teks (substring atau urutan karakter)
function fuzzyMatch(teks, query) {
    teks = teks.toLowerCase();
    query = query.toLowerCase();
    if (teks.includes(query)) return true;
    let qi = 0;
    for (let i = 0; i < teks.length && qi < query.length; i++) {
        if (teks[i] === query[qi]) qi++;
    }
    return qi === query.length;
}

function cariGejala(query) {
    const kodeTerpilih = new Set(gejalaTerpilih.map(s => s.code));
    return semuaGejala
        .filter(s => !kodeTerpilih.has(s.code))
        .filter(s => fuzzyMatch(s.name, query) || (s.description && fuzzyMatch(s.description, query)))
        .slice(0, 8);
}

searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();

    if (q.length === 0) {
        searchClear.classList.add('hidden');
        searchHint.classList.add('hidden');
        tutupDropdown();
        return;
    }

    searchClear.classList.remove('hidden');

    if (q.length < MIN_CHARS) {
        searchHint.textContent = `Ketik ${MIN_CHARS - q.length} karakter lagi`;
        searchHint.classList.remove('hidden');
        tutupDropdown();
        return;
    }

    searchHint.classList.add('hidden');
    tampilkanDropdown(cariGejala(q));
});

searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') tutupDropdown();
});

searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.add('hidden');
    searchHint.classList.add('hidden');
    tutupDropdown();
    searchInput.focus();
});

// tutup dropdown kalau klik di luar
document.addEventListener('click', e => {
    if (!e.target.closest('.search-wrapper') && !e.target.closest('.dropdown')) {
        tutupDropdown();
    }
});

function tampilkanDropdown(gejala) {
    if (gejala.length === 0) { tutupDropdown(); return; }

    dropdown.innerHTML = gejala.map(s => `
        <button class="dropdown-item" data-code="${s.code}" data-name="${escHtml(s.name)}">
            <span class="dropdown-item-name">${highlight(s.name, searchInput.value)}</span>
            ${s.description ? `<span class="dropdown-item-desc">${escHtml(s.description)}</span>` : ''}
        </button>
    `).join('');

    dropdown.querySelectorAll('.dropdown-item').forEach(btn => {
        btn.addEventListener('mousedown', e => {
            e.preventDefault();
            pilihGejala({ code: btn.dataset.code, name: btn.dataset.name });
        });
    });

    dropdown.classList.remove('hidden');
}

function tutupDropdown() {
    dropdown.classList.add('hidden');
    dropdown.innerHTML = '';
}

function highlight(teks, query) {
    if (!query) return escHtml(teks);
    const idx = teks.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return escHtml(teks);
    return escHtml(teks.slice(0, idx))
        + `<mark style="background:rgba(13,148,136,0.15);color:#0f766e;border-radius:3px;">${escHtml(teks.slice(idx, idx + query.length))}</mark>`
        + escHtml(teks.slice(idx + query.length));
}

function escHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function pilihGejala(gejala) {
    if (gejalaTerpilih.find(s => s.code === gejala.code)) return;
    gejalaTerpilih.push(gejala);
    searchInput.value = '';
    searchClear.classList.add('hidden');
    searchHint.classList.add('hidden');
    tutupDropdown();
    searchInput.focus();
    renderPills();
    updateTombol();
}

function hapusGejala(code) {
    gejalaTerpilih = gejalaTerpilih.filter(s => s.code !== code);
    renderPills();
    updateTombol();
}

function renderPills() {
    const jumlah = gejalaTerpilih.length;
    selectedCount.textContent = `${jumlah} / min. ${MIN_SELECTED}`;
    selectedCount.classList.toggle('ready', jumlah >= MIN_SELECTED);

    if (jumlah === 0) {
        pillsEmpty.classList.remove('hidden');
        pillsContainer.classList.add('hidden');
        pillsContainer.innerHTML = '';
        return;
    }

    pillsEmpty.classList.add('hidden');
    pillsContainer.classList.remove('hidden');
    pillsContainer.innerHTML = gejalaTerpilih.map(s => `
        <span class="pill">
            ${escHtml(s.name)}
            <button class="pill-remove" data-code="${s.code}" aria-label="Hapus ${escHtml(s.name)}">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
            </button>
        </span>
    `).join('');

    pillsContainer.querySelectorAll('.pill-remove').forEach(btn => {
        btn.addEventListener('click', () => hapusGejala(btn.dataset.code));
    });
}

function updateTombol() {
    const jumlah = gejalaTerpilih.length;
    submitBtn.disabled = jumlah < MIN_SELECTED;

    if (jumlah > 0 && jumlah < MIN_SELECTED) {
        validationMsg.textContent = `Tambahkan ${MIN_SELECTED - jumlah} gejala lagi untuk melanjutkan.`;
        validationMsg.classList.remove('hidden');
    } else {
        validationMsg.classList.add('hidden');
    }
}

submitBtn.addEventListener('click', async () => {
    if (gejalaTerpilih.length < MIN_SELECTED) return;

    viewForm.classList.add('hidden');
    viewLoading.classList.remove('hidden');

    try {
        const res = await fetch('/api/diagnose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symptom_codes: gejalaTerpilih.map(s => s.code) })
        });
        const json = await res.json();

        if (json.status !== 'success') throw new Error(json.message || 'Server error');

        viewLoading.classList.add('hidden');
        tampilkanHasil(json.data);
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
    gejalaTerpilih = [];
    renderPills();
    updateTombol();
    viewResult.classList.add('hidden');
    viewForm.classList.remove('hidden');
});

function tampilkanHasil(data) {
    const results = data.results || [];
    const resultCard = document.getElementById('resultCard');
    const otherResults = document.getElementById('otherResults');

    // tidak ada yang terdeteksi
    if (results.length === 0 || !results[0].is_above_threshold) {
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

    // animasi progress bar
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const fill = document.getElementById('scoreFill');
            if (fill) fill.style.width = `${Math.min(top.score_percentage, 100)}%`;
        });
    });

    // hasil penyakit lainnya
    const sisanya = results.slice(1, 5);
    if (sisanya.length > 0) {
        otherResults.innerHTML = `
            <div class="other-results-section">
                <h3>Hasil Lainnya</h3>
                ${sisanya.map(r => `
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

init();
