/* ==========================================================================
   ProjectMatcher - JavaScript Logic & Interactive Engine
   ========================================================================== */



// Current State
let currentSlide = 1;
const totalSlides = 5;
let activeTab = 'slides-tab';
let selectedHpoChips = [
  { code: 'HP:0001250', name: 'Seizures' },
  { code: 'HP:0001263', name: 'Global developmental delay' }
];

// Initialize Application on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initSlideDeck();
  renderProjectsGrid(projectsData);
  initProjectForm();
  initMatchSimulator();
  initModalControls();
  initThemeToggle();
});

/* ==========================================================================
   NAVIGATION & TABS ENGINE
   ========================================================================== */

function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
}

function switchTab(tabId) {
  activeTab = tabId;
  
  // Update nav buttons active state
  document.querySelectorAll('.nav-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update tab panes visibility
  document.querySelectorAll('.tab-pane').forEach(pane => {
    if (pane.id === tabId) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================================================
   SLIDE DECK ENGINE (2D PRESENTATION)
   ========================================================================== */

function initSlideDeck() {
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');
  const indicatorsContainer = document.getElementById('slide-indicators');
  const fullscreenBtn = document.getElementById('fullscreen-slide');

  // Build dots
  indicatorsContainer.innerHTML = '';
  for (let i = 1; i <= totalSlides; i++) {
    const dot = document.createElement('div');
    dot.className = `slide-dot ${i === 1 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(i));
    indicatorsContainer.appendChild(dot);
  }

  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

  // Fullscreen button
  fullscreenBtn.addEventListener('click', () => {
    const slideElem = document.getElementById('slide-container');
    if (!document.fullscreenElement) {
      slideElem.requestFullscreen().catch(err => alert(`Error activando pantalla completa: ${err.message}`));
    } else {
      document.exitFullscreen();
    }
  });

  // Keyboard navigation for slides
  document.addEventListener('keydown', (e) => {
    if (activeTab !== 'slides-tab') return;
    if (e.key === 'ArrowLeft') {
      goToSlide(currentSlide - 1);
    } else if (e.key === 'ArrowRight') {
      goToSlide(currentSlide + 1);
    }
  });
}

function goToSlide(slideNum) {
  if (slideNum < 1) slideNum = 1;
  if (slideNum > totalSlides) slideNum = totalSlides;

  currentSlide = slideNum;

  // Toggle active class on slides
  document.querySelectorAll('.slide').forEach(slide => {
    if (parseInt(slide.getAttribute('data-slide')) === currentSlide) {
      slide.classList.add('active');
    } else {
      slide.classList.remove('active');
    }
  });

  // Update dots
  const dots = document.querySelectorAll('.slide-dot');
  dots.forEach((dot, idx) => {
    if (idx + 1 === currentSlide) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

/* ==========================================================================
   EXPLORER & PROJECTS GRID RENDERER
   ========================================================================== */

function renderProjectsGrid(projects) {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '';

  // Update statistics
  document.getElementById('stat-total-projects').textContent = projects.length;
  const totalN = projects.reduce((acc, p) => acc + p.currentN, 0);
  document.getElementById('stat-total-patients').textContent = totalN;

  if (projects.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-color);">
        <i class="fa-solid fa-folder-open" style="font-size: 2.5rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
        <h3>No se encontraron proyectos con los filtros seleccionados</h3>
        <p style="color: var(--text-secondary); margin-top: 0.5rem;">Intenta cambiar los parámetros de búsqueda o limpiar los filtros.</p>
      </div>
    `;
    return;
  }

  projects.forEach(p => {
    const progressPercent = Math.min(Math.round((p.currentN / p.targetN) * 100), 100);

    let statusClass = 'status-recruiting';
    if (p.status === 'functional') statusClass = 'status-functional';
    if (p.status === 'manuscript') statusClass = 'status-manuscript';

    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div>
        <div class="project-card-header">
          <span class="gene-badge">${p.gene}</span>
          <span class="status-badge ${statusClass}">${p.statusLabel}</span>
        </div>
        <h3 class="project-title">${p.title}</h3>
        <p class="project-institution">
          <i class="fa-solid fa-hospital-user color-primary"></i> ${p.institution} (${p.ip})
        </p>
      </div>

      <div class="cohort-progress-container">
        <div class="cohort-progress-label">
          <span>Progreso Cohorte ($N$):</span>
          <span><strong>${p.currentN}</strong> / ${p.targetN} pacientes (${progressPercent}%)</span>
        </div>
        <div class="cohort-progress-bar">
          <div class="cohort-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>

      <div class="hpo-tags-wrapper">
        ${p.hpoTerms.map(h => `<span class="hpo-tag">${h.code} ${h.name}</span>`).join('')}
      </div>

      <div class="card-actions">
        <button class="btn btn-secondary full-width" onclick="openProjectModal('${p.id}')">
          <i class="fa-solid fa-circle-info"></i> Detalle & Colaborar
        </button>
      </div>
    `;

    grid.appendChild(card);
  });

  // Setup Sidebar Filter listeners
  setupFilters();
}

function setupFilters() {
  const searchGene = document.getElementById('search-gene');
  const filterRegion = document.getElementById('filter-region');
  const filterStatus = document.getElementById('filter-status');
  const filterHpo = document.getElementById('filter-hpo');
  const resetBtn = document.getElementById('reset-filters');

  const applyFilters = () => {
    const geneVal = searchGene.value.trim().toLowerCase();
    const regionVal = filterRegion.value;
    const statusVal = filterStatus.value;
    const hpoVal = filterHpo.value;

    const filtered = projectsData.filter(p => {
      // Gene match
      if (geneVal && !p.gene.toLowerCase().includes(geneVal) && !p.title.toLowerCase().includes(geneVal)) {
        return false;
      }
      // Region match
      if (regionVal !== 'all' && p.region !== regionVal) {
        return false;
      }
      // Status match
      if (statusVal !== 'all' && p.status !== statusVal) {
        return false;
      }
      // HPO match
      if (hpoVal !== 'all') {
        const hasHpo = p.hpoTerms.some(h => {
          if (hpoVal === 'seizures') return h.code === 'HP:0001250';
          if (hpoVal === 'delay') return h.code === 'HP:0001263';
          if (hpoVal === 'autism') return h.code === 'HP:0000729';
          if (hpoVal === 'hypotonia') return h.code === 'HP:0001290';
          return true;
        });
        if (!hasHpo) return false;
      }
      return true;
    });

    renderProjectsGrid(filtered);
  };

  searchGene.removeEventListener('input', applyFilters);
  searchGene.addEventListener('input', applyFilters);

  filterRegion.removeEventListener('change', applyFilters);
  filterRegion.addEventListener('change', applyFilters);

  filterStatus.removeEventListener('change', applyFilters);
  filterStatus.addEventListener('change', applyFilters);

  filterHpo.removeEventListener('change', applyFilters);
  filterHpo.addEventListener('change', applyFilters);

  resetBtn.addEventListener('click', () => {
    searchGene.value = '';
    filterRegion.value = 'all';
    filterStatus.value = 'all';
    filterHpo.value = 'all';
    renderProjectsGrid(projectsData);
  });
}

/* ==========================================================================
   NEW PROJECT FORM ENGINE
   ========================================================================== */

function initProjectForm() {
  const form = document.getElementById('new-project-form');
  const addHpoBtn = document.getElementById('add-hpo-btn');
  const hpoInput = document.getElementById('hpo-search-input');
  const chipsContainer = document.getElementById('hpo-chips');

  // Render initial chips
  renderHpoChips();

  addHpoBtn.addEventListener('click', () => {
    const val = hpoInput.value.trim();
    if (!val) return;
    
    // Parse HPO Code or raw string
    let code = 'HP:0000000';
    let name = val;
    if (val.includes('HP:')) {
      const parts = val.split(' ');
      code = parts[0];
      name = parts.slice(1).join(' ') || code;
    }

    selectedHpoChips.push({ code, name });
    hpoInput.value = '';
    renderHpoChips();
  });

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const gene = document.getElementById('input-gene').value.trim().toUpperCase();
    const title = document.getElementById('input-title').value.trim();
    const ip = document.getElementById('input-ip-name').value.trim();
    const institution = document.getElementById('input-institution').value.trim();
    const email = document.getElementById('input-email').value.trim();
    const region = document.getElementById('input-region').value;
    const mechanism = document.getElementById('input-mechanism').value;
    const currentN = parseInt(document.getElementById('input-current-n').value) || 1;
    const targetN = parseInt(document.getElementById('input-target-n').value) || 10;
    const status = document.getElementById('input-status').value;
    const description = document.getElementById('input-description').value.trim();
    const visibility = document.querySelector('input[name="visibility"]:checked').value;

    // Selected experimental models
    const selectedModels = [];
    document.querySelectorAll('input[name="models"]:checked').forEach(cb => {
      selectedModels.push(cb.value);
    });

    let statusLabel = 'Reclutando Cohorte';
    if (status === 'functional') statusLabel = 'Validación Funcional en Curso';
    if (status === 'manuscript') statusLabel = 'Buscando Casos para Manuscrito';

    const newProject = {
      id: `proj-${Date.now()}`,
      gene,
      title,
      ip,
      institution,
      region,
      email,
      mechanism,
      hpoTerms: [...selectedHpoChips],
      currentN,
      targetN,
      status,
      statusLabel,
      models: selectedModels,
      description,
      visibility
    };

    // Add to dataset
    projectsData.unshift(newProject);

    alert(`¡Proyecto en ${gene} publicado con éxito en ProjectMatcher!`);

    // Reset Form
    form.reset();
    selectedHpoChips = [
      { code: 'HP:0001250', name: 'Seizures' },
      { code: 'HP:0001263', name: 'Global developmental delay' }
    ];
    renderHpoChips();

    // Switch to Explorer tab to see new project
    renderProjectsGrid(projectsData);
    switchTab('explorer-tab');
  });
}

function renderHpoChips() {
  const container = document.getElementById('hpo-chips');
  container.innerHTML = '';

  selectedHpoChips.forEach((chip, index) => {
    const chipElem = document.createElement('span');
    chipElem.className = 'hpo-chip';
    chipElem.innerHTML = `
      ${chip.code} ${chip.name}
      <i class="fa-solid fa-xmark remove-chip" onclick="removeHpoChip(${index})"></i>
    `;
    container.appendChild(chipElem);
  });
}

function removeHpoChip(index) {
  selectedHpoChips.splice(index, 1);
  renderHpoChips();
}

/* ==========================================================================
   LIVE MATCH SIMULATOR ENGINE
   ========================================================================== */

function initMatchSimulator() {
  const runBtn = document.getElementById('run-match-btn');
  runBtn.addEventListener('click', runMatchSimulation);

  // Run initial simulation
  runMatchSimulation();
}

function runMatchSimulation() {
  const queryGene = document.getElementById('sim-gene').value.trim().toUpperCase();
  const queryMech = document.getElementById('sim-mechanism').value;
  const queryHpo = document.getElementById('sim-hpo').value;

  const resultsList = document.getElementById('results-list');
  resultsList.innerHTML = '';

  // Calculate scores for each project in database
  const scoredProjects = projectsData.map(p => {
    let score = 0;
    let breakdown = { gene: 0, hpo: 0, mech: 0 };

    // 1. Gene Match (40% weight)
    if (p.gene.toUpperCase() === queryGene) {
      score += 40;
      breakdown.gene = 100;
    } else {
      breakdown.gene = 0;
    }

    // 2. HPO Match (30% weight)
    const hasQueryHpo = p.hpoTerms.some(h => h.code === queryHpo);
    if (hasQueryHpo) {
      score += 30;
      breakdown.hpo = 100;
    } else {
      score += 15; // Partial similarity score
      breakdown.hpo = 50;
    }

    // 3. Mechanism Match (20% weight)
    if (p.mechanism === queryMech) {
      score += 20;
      breakdown.mech = 100;
    } else {
      score += 10;
      breakdown.mech = 50;
    }

    // 4. Cohort Complementarity (10% weight)
    score += 10;

    return { project: p, score: Math.round(score), breakdown };
  });

  // Sort by highest match score
  scoredProjects.sort((a, b) => b.score - a.score);

  document.getElementById('results-count').textContent = scoredProjects.length;

  scoredProjects.forEach(item => {
    const p = item.project;
    const resultCard = document.createElement('div');
    resultCard.className = 'result-item';
    resultCard.innerHTML = `
      <div class="match-score-pill">
        ${item.score}%
        <span>MATCH</span>
      </div>

      <div class="result-info">
        <div class="result-gene-title">
          <span class="gene-badge" style="font-size: 0.95rem;">${p.gene}</span>
          <strong>${p.title}</strong>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">
          <i class="fa-solid fa-hospital"></i> ${p.institution} (${p.ip}) | Cohorte: <strong>${p.currentN}/${p.targetN}</strong>
        </p>
        <div class="result-breakdown">
          <span><i class="fa-solid fa-dna color-primary"></i> Gen Match: ${item.breakdown.gene}%</span>
          <span><i class="fa-solid fa-notes-medical color-cyan"></i> HPO Score: ${item.breakdown.hpo}%</span>
          <span><i class="fa-solid fa-gears color-warning"></i> Mecanismo: ${item.breakdown.mech}%</span>
        </div>
      </div>

      <div>
        <button class="btn btn-primary" onclick="openProjectModal('${p.id}')">
          <i class="fa-solid fa-paper-plane"></i> Contactar IP
        </button>
      </div>
    `;

    resultsList.appendChild(resultCard);
  });
}

/* ==========================================================================
   MODAL WINDOW CONTROLS
   ========================================================================== */

function initModalControls() {
  const modal = document.getElementById('project-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const closeAction = document.getElementById('modal-close-action');
  const connectBtn = document.getElementById('modal-connect-btn');

  const closeModal = () => modal.classList.remove('active');

  closeBtn.addEventListener('click', closeModal);
  closeAction.addEventListener('click', closeModal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  connectBtn.addEventListener('click', () => {
    alert('¡Solicitud de colaboración enviada! El Investigador Principal recibirá una notificación cifrada.');
    closeModal();
  });
}

function openProjectModal(projectId) {
  const p = projectsData.find(item => item.id === projectId);
  if (!p) return;

  const modal = document.getElementById('project-modal');
  document.getElementById('modal-gene-title').textContent = `${p.gene} - ${p.title}`;

  const body = document.getElementById('modal-body-content');
  const progressPercent = Math.min(Math.round((p.currentN / p.targetN) * 100), 100);

  body.innerHTML = `
    <div style="display: flex; gap: 1rem; align-items: center; background: rgba(99, 102, 241, 0.1); padding: 1rem; border-radius: var(--radius-md); border: 1px solid rgba(99, 102, 241, 0.3);">
      <span class="gene-badge" style="font-size: 1.5rem;">${p.gene}</span>
      <div>
        <strong style="font-size: 1.1rem; display: block;">${p.title}</strong>
        <span style="font-size: 0.85rem; color: var(--text-secondary);"><i class="fa-solid fa-user-doctor"></i> ${p.ip} — ${p.institution} (${p.email})</span>
      </div>
    </div>

    <div>
      <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--accent-primary);">Progreso de la Cohorte de Pacientes:</h4>
      <div class="cohort-progress-container">
        <div class="cohort-progress-label">
          <span>Reclutamiento Actual:</span>
          <span><strong>${p.currentN}</strong> / ${p.targetN} Pacientes Caracterizados (${progressPercent}%)</span>
        </div>
        <div class="cohort-progress-bar" style="height: 12px;">
          <div class="cohort-progress-fill" style="width: ${progressPercent}%;"></div>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
      <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <strong style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Mecanismo Mutacional:</strong>
        <p style="font-size: 0.95rem; font-weight: 600; color: var(--accent-cyan); margin-top: 0.2rem;">${p.mechanism}</p>
      </div>

      <div style="background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        <strong style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase;">Estado del Proyecto:</strong>
        <p style="font-size: 0.95rem; font-weight: 600; color: var(--accent-teal); margin-top: 0.2rem;">${p.statusLabel}</p>
      </div>
    </div>

    <div>
      <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--accent-primary);">Fenotipo HPO Registrado:</h4>
      <div class="hpo-tags-wrapper">
        ${p.hpoTerms.map(h => `<span class="hpo-chip">${h.code} ${h.name}</span>`).join('')}
      </div>
    </div>

    <div>
      <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--accent-primary);">Modelos & Ensayos en el Laboratorio:</h4>
      <ul style="list-style: disc; padding-left: 1.2rem; font-size: 0.9rem; color: var(--text-secondary);">
        ${p.models.map(m => `<li>${m}</li>`).join('')}
      </ul>
    </div>

    <div>
      <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--accent-primary);">Resumen & Criterios de Inclusión:</h4>
      <p style="font-size: 0.9rem; color: var(--text-secondary); background: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
        ${p.description}
      </p>
    </div>
  `;

  modal.classList.add('active');
}

/* ==========================================================================
   THEME TOGGLE
   ========================================================================== */

function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    toggleBtn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
  });
}
