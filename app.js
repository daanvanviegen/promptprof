// Data storage
let logboeken = [];
let tekeningen = [];
let werkzaamheden = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initTabs();
    initLogboeken();
    initTekeningen();
    initWerkzaamheden();
    renderAll();
});

// Load data from localStorage
function loadData() {
    const savedLogboeken = localStorage.getItem('logboeken');
    const savedTekeningen = localStorage.getItem('tekeningen');
    const savedWerkzaamheden = localStorage.getItem('werkzaamheden');

    if (savedLogboeken) logboeken = JSON.parse(savedLogboeken);
    if (savedTekeningen) tekeningen = JSON.parse(savedTekeningen);
    if (savedWerkzaamheden) werkzaamheden = JSON.parse(savedWerkzaamheden);
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('logboeken', JSON.stringify(logboeken));
    localStorage.setItem('tekeningen', JSON.stringify(tekeningen));
    localStorage.setItem('werkzaamheden', JSON.stringify(werkzaamheden));
}

// Tab navigation
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab
            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// ====== LOGBOEKEN ======

function initLogboeken() {
    const modal = document.getElementById('logboekModal');
    const newBtn = document.getElementById('newLogboekBtn');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('cancelLogboek');
    const form = document.getElementById('logboekForm');

    newBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        form.reset();
        // Set default date to today
        document.getElementById('startDatum').valueAsDate = new Date();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const logboek = {
            id: Date.now(),
            projectNaam: document.getElementById('projectNaam').value,
            projectLocatie: document.getElementById('projectLocatie').value,
            projectOpdrachtgever: document.getElementById('projectOpdrachtgever').value,
            startDatum: document.getElementById('startDatum').value,
            projectBeschrijving: document.getElementById('projectBeschrijving').value,
            aanmaakDatum: new Date().toISOString()
        };

        logboeken.push(logboek);
        saveData();
        renderLogboeken();
        updateLogboekSelects();
        modal.style.display = 'none';
        form.reset();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function renderLogboeken() {
    const container = document.getElementById('logboekenList');

    if (logboeken.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">Nog geen logboeken aangemaakt</div>
                <p>Klik op "+ Nieuw Logboek" om te beginnen</p>
            </div>
        `;
        return;
    }

    container.innerHTML = logboeken.map(logboek => `
        <div class="logboek-card">
            <h3>${logboek.projectNaam}</h3>
            <p>${logboek.projectBeschrijving || 'Geen beschrijving'}</p>
            <div class="logboek-info">
                <div class="info-item">
                    <span class="info-label">Locatie</span>
                    <span class="info-value">${logboek.projectLocatie}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Opdrachtgever</span>
                    <span class="info-value">${logboek.projectOpdrachtgever}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Startdatum</span>
                    <span class="info-value">${formatDate(logboek.startDatum)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Aangemaakt</span>
                    <span class="info-value">${formatDate(logboek.aanmaakDatum)}</span>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn btn-danger" onclick="deleteLogboek(${logboek.id})">Verwijderen</button>
            </div>
        </div>
    `).join('');
}

function deleteLogboek(id) {
    if (confirm('Weet je zeker dat je dit logboek wilt verwijderen? Dit verwijdert ook alle gekoppelde tekeningen en werkzaamheden.')) {
        logboeken = logboeken.filter(l => l.id !== id);
        tekeningen = tekeningen.filter(t => t.logboekId !== id);
        werkzaamheden = werkzaamheden.filter(w => w.logboekId !== id);
        saveData();
        renderAll();
    }
}

// ====== TEKENINGEN ======

function initTekeningen() {
    const modal = document.getElementById('tekeningModal');
    const viewModal = document.getElementById('tekeningViewModal');
    const uploadBtn = document.getElementById('uploadTekeningingBtn');
    const closeBtn = modal.querySelector('.close');
    const viewCloseBtn = viewModal.querySelector('.close');
    const cancelBtn = document.getElementById('cancelTekening');
    const form = document.getElementById('tekeningForm');
    const filter = document.getElementById('logboekFilter');

    uploadBtn.addEventListener('click', () => {
        if (logboeken.length === 0) {
            alert('Maak eerst een logboek aan voordat je tekeningen kunt uploaden.');
            return;
        }
        modal.style.display = 'block';
        form.reset();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    viewCloseBtn.addEventListener('click', () => {
        viewModal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const fileInput = document.getElementById('tekeningFile');
        const file = fileInput.files[0];

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const tekening = {
                    id: Date.now(),
                    logboekId: parseInt(document.getElementById('tekeningLogboek').value),
                    naam: document.getElementById('tekeningNaam').value,
                    type: document.getElementById('tekeningType').value,
                    notities: document.getElementById('tekeningNotities').value,
                    fileData: e.target.result,
                    fileName: file.name,
                    fileType: file.type,
                    uploadDatum: new Date().toISOString()
                };

                tekeningen.push(tekening);
                saveData();
                renderTekeningen();
                modal.style.display = 'none';
                form.reset();
            };
            reader.readAsDataURL(file);
        }
    });

    filter.addEventListener('change', renderTekeningen);

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
        if (e.target === viewModal) {
            viewModal.style.display = 'none';
        }
    });
}

function renderTekeningen() {
    const container = document.getElementById('tekeningenList');
    const filter = document.getElementById('logboekFilter').value;

    let filteredTekeningen = tekeningen;
    if (filter) {
        filteredTekeningen = tekeningen.filter(t => t.logboekId === parseInt(filter));
    }

    if (filteredTekeningen.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📐</div>
                <div class="empty-state-text">Nog geen tekeningen geüpload</div>
                <p>Klik op "+ Upload Tekening" om te beginnen</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredTekeningen.map(tekening => {
        const logboek = logboeken.find(l => l.id === tekening.logboekId);
        const isImage = tekening.fileType.startsWith('image/');

        return `
            <div class="tekening-card" onclick="viewTekening(${tekening.id})">
                ${isImage ?
                    `<img src="${tekening.fileData}" alt="${tekening.naam}" class="tekening-preview">` :
                    `<div class="tekening-preview" style="display: flex; align-items: center; justify-content: center; background: #f1f5f9;">
                        <span style="font-size: 3rem;">📄</span>
                    </div>`
                }
                <div class="tekening-info">
                    <h4>${tekening.naam}</h4>
                    <div class="tekening-meta">Type: ${tekening.type}</div>
                    <div class="tekening-meta">Logboek: ${logboek ? logboek.projectNaam : 'Onbekend'}</div>
                    <div class="tekening-meta">Upload: ${formatDate(tekening.uploadDatum)}</div>
                </div>
                <div class="tekening-actions">
                    <button class="btn btn-danger" onclick="event.stopPropagation(); deleteTekening(${tekening.id})">Verwijderen</button>
                </div>
            </div>
        `;
    }).join('');
}

function viewTekening(id) {
    const tekening = tekeningen.find(t => t.id === id);
    if (!tekening) return;

    const logboek = logboeken.find(l => l.id === tekening.logboekId);
    const modal = document.getElementById('tekeningViewModal');
    const content = document.getElementById('tekeningViewContent');

    const isImage = tekening.fileType.startsWith('image/');

    content.innerHTML = `
        <h3>${tekening.naam}</h3>
        ${isImage ?
            `<img src="${tekening.fileData}" alt="${tekening.naam}" style="max-width: 100%; height: auto; border-radius: 8px;">` :
            `<div style="padding: 40px; text-align: center; background: #f1f5f9; border-radius: 8px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">📄</div>
                <p>PDF weergave (${tekening.fileName})</p>
                <a href="${tekening.fileData}" download="${tekening.fileName}" class="btn btn-primary" style="margin-top: 20px; display: inline-block;">Download PDF</a>
            </div>`
        }
        <div class="tekening-details">
            <p><strong>Type:</strong> ${tekening.type}</p>
            <p><strong>Logboek:</strong> ${logboek ? logboek.projectNaam : 'Onbekend'}</p>
            <p><strong>Geüpload:</strong> ${formatDate(tekening.uploadDatum)}</p>
            ${tekening.notities ? `<p><strong>Notities:</strong> ${tekening.notities}</p>` : ''}
        </div>
    `;

    modal.style.display = 'block';
}

function deleteTekening(id) {
    if (confirm('Weet je zeker dat je deze tekening wilt verwijderen?')) {
        tekeningen = tekeningen.filter(t => t.id !== id);
        saveData();
        renderTekeningen();
    }
}

// ====== WERKZAAMHEDEN ======

function initWerkzaamheden() {
    const modal = document.getElementById('werkzaamheidModal');
    const newBtn = document.getElementById('newWerkzaamheidBtn');
    const closeBtn = modal.querySelector('.close');
    const cancelBtn = document.getElementById('cancelWerkzaamheid');
    const form = document.getElementById('werkzaamheidForm');
    const filter = document.getElementById('werkzaamheidLogboekFilter');

    newBtn.addEventListener('click', () => {
        if (logboeken.length === 0) {
            alert('Maak eerst een logboek aan voordat je werkzaamheden kunt toevoegen.');
            return;
        }
        modal.style.display = 'block';
        form.reset();
        // Set default date to today
        document.getElementById('werkzaamheidDatum').valueAsDate = new Date();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const werkzaamheid = {
            id: Date.now(),
            logboekId: parseInt(document.getElementById('werkzaamheidLogboek').value),
            datum: document.getElementById('werkzaamheidDatum').value,
            type: document.getElementById('werkzaamheidType').value,
            uitvoerder: document.getElementById('werkzaamheidUitvoerder').value,
            beschrijving: document.getElementById('werkzaamheidBeschrijving').value,
            status: document.getElementById('werkzaamheidStatus').value,
            opmerkingen: document.getElementById('werkzaamheidOpmerkingen').value,
            aanmaakDatum: new Date().toISOString()
        };

        werkzaamheden.push(werkzaamheid);
        saveData();
        renderWerkzaamheden();
        modal.style.display = 'none';
        form.reset();
    });

    filter.addEventListener('change', renderWerkzaamheden);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function renderWerkzaamheden() {
    const container = document.getElementById('werkzaamhedenList');
    const filter = document.getElementById('werkzaamheidLogboekFilter').value;

    let filteredWerkzaamheden = werkzaamheden;
    if (filter) {
        filteredWerkzaamheden = werkzaamheden.filter(w => w.logboekId === parseInt(filter));
    }

    // Sort by date (newest first)
    filteredWerkzaamheden.sort((a, b) => new Date(b.datum) - new Date(a.datum));

    if (filteredWerkzaamheden.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔨</div>
                <div class="empty-state-text">Nog geen werkzaamheden toegevoegd</div>
                <p>Klik op "+ Nieuwe Werkzaamheid" om te beginnen</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredWerkzaamheden.map(werkzaamheid => {
        const logboek = logboeken.find(l => l.id === werkzaamheid.logboekId);

        return `
            <div class="werkzaamheid-card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <h3>${werkzaamheid.type.charAt(0).toUpperCase() + werkzaamheid.type.slice(1)}</h3>
                    <span class="status-badge status-${werkzaamheid.status}">${werkzaamheid.status.charAt(0).toUpperCase() + werkzaamheid.status.slice(1)}</span>
                </div>
                <p style="margin-top: 10px; color: var(--text-secondary);">${werkzaamheid.beschrijving}</p>
                <div class="werkzaamheid-info">
                    <div class="info-item">
                        <span class="info-label">Datum</span>
                        <span class="info-value">${formatDate(werkzaamheid.datum)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Uitvoerder</span>
                        <span class="info-value">${werkzaamheid.uitvoerder}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Logboek</span>
                        <span class="info-value">${logboek ? logboek.projectNaam : 'Onbekend'}</span>
                    </div>
                </div>
                ${werkzaamheid.opmerkingen ? `
                    <div style="margin-top: 15px; padding: 12px; background: var(--background); border-radius: 6px;">
                        <strong style="color: var(--text-secondary); font-size: 0.9rem;">Opmerkingen:</strong>
                        <p style="margin-top: 5px; color: var(--text-primary);">${werkzaamheid.opmerkingen}</p>
                    </div>
                ` : ''}
                <div class="card-actions">
                    <button class="btn btn-danger" onclick="deleteWerkzaamheid(${werkzaamheid.id})">Verwijderen</button>
                </div>
            </div>
        `;
    }).join('');
}

function deleteWerkzaamheid(id) {
    if (confirm('Weet je zeker dat je deze werkzaamheid wilt verwijderen?')) {
        werkzaamheden = werkzaamheden.filter(w => w.id !== id);
        saveData();
        renderWerkzaamheden();
    }
}

// ====== UTILITY FUNCTIONS ======

function updateLogboekSelects() {
    const selects = [
        document.getElementById('tekeningLogboek'),
        document.getElementById('werkzaamheidLogboek'),
        document.getElementById('logboekFilter'),
        document.getElementById('werkzaamheidLogboekFilter')
    ];

    selects.forEach(select => {
        const currentValue = select.value;
        const isFilter = select.id.includes('Filter');

        select.innerHTML = isFilter ? '<option value="">Alle logboeken</option>' : '<option value="">Selecteer logboek...</option>';

        logboeken.forEach(logboek => {
            const option = document.createElement('option');
            option.value = logboek.id;
            option.textContent = logboek.projectNaam;
            select.appendChild(option);
        });

        select.value = currentValue;
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function renderAll() {
    renderLogboeken();
    renderTekeningen();
    renderWerkzaamheden();
    updateLogboekSelects();
}
