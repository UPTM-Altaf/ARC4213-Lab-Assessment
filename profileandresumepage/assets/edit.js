/* ==========================================================
   edit.js — Edit Profile page (edit.html)
   Loads data from localStorage, lets user edit everything,
   saves back to localStorage on submit.
   ========================================================== */

var DEFAULT_DATA = {
  name:      '',
  title:     '',
  tagline:   '',
  bio:       '',
  email:     '',
  phone:     '',
  location:  '',
  github:    '',
  linkedin:  '',
  photo:     '',
  skills: [
    { category: '', name: '',           level: 0 },

  ],
  softSkills: [''],
  education: [
    {
      degree:      '',
      institution: '',
      period:      '',
      description: ''
    },

  ]
};

function loadData() {
  try {
    var saved = localStorage.getItem('resumeProfileData');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return DEFAULT_DATA;
}

function saveData(data) {
  localStorage.setItem('resumeProfileData', JSON.stringify(data));
}

function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ----------------------------------------------------------
   Photo
   ---------------------------------------------------------- */
var currentPhotoBase64 = '';

function setupPhoto() {
  var placeholder = document.getElementById('edit-photo-placeholder');
  var preview     = document.getElementById('edit-photo-preview');
  var fileInput   = document.getElementById('photo-upload-input');
  var removeBtn   = document.getElementById('remove-photo-btn');

  // Load existing photo
  currentPhotoBase64 = localStorage.getItem('resumeProfilePhoto') || '';
  if (currentPhotoBase64) {
    preview.src = currentPhotoBase64;
    preview.classList.remove('hidden');
    placeholder.classList.add('hidden');
    removeBtn.classList.remove('hidden');
  }

  // Upload new photo
  fileInput.addEventListener('change', function () {
    var file = fileInput.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert('save-alert', 'error', 'Photo must be under 5 MB.');
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      currentPhotoBase64 = e.target.result;
      preview.src = currentPhotoBase64;
      preview.classList.remove('hidden');
      placeholder.classList.add('hidden');
      removeBtn.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  // Remove photo
  removeBtn.addEventListener('click', function () {
    currentPhotoBase64 = '';
    preview.src = '';
    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
    removeBtn.classList.add('hidden');
    fileInput.value = '';
  });
}

/* ----------------------------------------------------------
   Skills rows
   ---------------------------------------------------------- */
function makeSkillRow(skill) {
  var row = document.createElement('div');
  row.className = 'repeat-row skill-input-row';
  row.innerHTML =
    '<input type="text"   class="skill-cat"   placeholder="Category (e.g. Languages)" value="' + esc(skill.category || '') + '">' +
    '<input type="text"   class="skill-name"  placeholder="Skill name"                value="' + esc(skill.name     || '') + '">' +
    '<input type="number" class="skill-level" placeholder="0-100" min="0" max="100"   value="' + esc(skill.level    || 50)  + '">' +
    '<button type="button" class="remove-row-btn" title="Remove">✕</button>';
  row.querySelector('.remove-row-btn').addEventListener('click', function () { row.remove(); });
  return row;
}

function setupSkills(data) {
  var container = document.getElementById('skills-rows');
  var addBtn    = document.getElementById('add-skill-btn');

  (data.skills || []).forEach(function (skill) {
    container.appendChild(makeSkillRow(skill));
  });

  addBtn.addEventListener('click', function () {
    var row = makeSkillRow({ category: '', name: '', level: 50 });
    container.appendChild(row);
    row.querySelector('input').focus();
  });
}

function collectSkills() {
  var rows = document.querySelectorAll('#skills-rows .skill-input-row');
  var result = [];
  rows.forEach(function (row) {
    var name = row.querySelector('.skill-name').value.trim();
    if (!name) return; // skip blank rows
    result.push({
      category: row.querySelector('.skill-cat').value.trim() || 'Other',
      name:     name,
      level:    Math.max(0, Math.min(100, parseInt(row.querySelector('.skill-level').value) || 50))
    });
  });
  return result;
}

/* ----------------------------------------------------------
   Education rows
   ---------------------------------------------------------- */
function makeEduRow(entry) {
  var row = document.createElement('div');
  row.className = 'repeat-row education-input-row';
  row.innerHTML =
    '<div class="form-row">' +
      '<input type="text" class="edu-degree"      placeholder="Degree / Qualification"  value="' + esc(entry.degree      || '') + '">' +
      '<input type="text" class="edu-period"       placeholder="Period (e.g. 2023 - Now)" value="' + esc(entry.period      || '') + '">' +
    '</div>' +
    '<input type="text" class="edu-institution"    placeholder="Institution"              value="' + esc(entry.institution || '') + '">' +
    '<textarea class="edu-description" rows="2"    placeholder="Short description">' + esc(entry.description || '') + '</textarea>' +
    '<button type="button" class="remove-row-btn">✕ Remove entry</button>';
  row.querySelector('.remove-row-btn').addEventListener('click', function () { row.remove(); });
  return row;
}

function setupEducation(data) {
  var container = document.getElementById('education-rows');
  var addBtn    = document.getElementById('add-education-btn');

  (data.education || []).forEach(function (entry) {
    container.appendChild(makeEduRow(entry));
  });

  addBtn.addEventListener('click', function () {
    var row = makeEduRow({ degree: '', institution: '', period: '', description: '' });
    container.appendChild(row);
    row.querySelector('input').focus();
  });
}

function collectEducation() {
  var rows = document.querySelectorAll('#education-rows .education-input-row');
  var result = [];
  rows.forEach(function (row) {
    var degree = row.querySelector('.edu-degree').value.trim();
    if (!degree) return;
    result.push({
      degree:      degree,
      institution: row.querySelector('.edu-institution').value.trim(),
      period:      row.querySelector('.edu-period').value.trim(),
      description: row.querySelector('.edu-description').value.trim()
    });
  });
  return result;
}

/* ----------------------------------------------------------
   Alerts
   ---------------------------------------------------------- */
function showAlert(id, type, html) {
  var el = document.getElementById(id);
  if (!el) return;
  el.className = 'alert alert-' + type;
  el.innerHTML = html;
  el.classList.remove('hidden');
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ----------------------------------------------------------
   Populate form fields from saved data
   ---------------------------------------------------------- */
function populateForm(data) {
  document.getElementById('edit-name').value      = data.name     || '';
  document.getElementById('edit-title').value     = data.title    || '';
  document.getElementById('edit-tagline').value   = data.tagline  || '';
  document.getElementById('edit-bio').value       = data.bio      || '';
  document.getElementById('edit-email').value     = data.email    || '';
  document.getElementById('edit-phone').value     = data.phone    || '';
  document.getElementById('edit-location').value  = data.location || '';
  document.getElementById('edit-github').value    = data.github   || '';
  document.getElementById('edit-linkedin').value  = data.linkedin || '';
  document.getElementById('edit-soft-skills').value =
    (data.softSkills || []).join(', ');
}

/* ----------------------------------------------------------
   Save button
   ---------------------------------------------------------- */
function setupSave() {
  document.getElementById('save-btn').addEventListener('click', function () {
    var name  = document.getElementById('edit-name').value.trim();
    var email = document.getElementById('edit-email').value.trim();
    var errors = [];

    if (!name)  errors.push('Name is required.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('A valid email address is required.');
    }

    if (errors.length) {
      showAlert('save-alert', 'error',
        '<strong>Could not save:</strong><ul>' +
        errors.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') +
        '</ul>');
      return;
    }

    // Collect soft skills
    var softRaw = document.getElementById('edit-soft-skills').value;
    var softSkills = softRaw.split(',').map(function (s) { return s.trim(); }).filter(Boolean);

    var data = {
      name:      name,
      title:     document.getElementById('edit-title').value.trim(),
      tagline:   document.getElementById('edit-tagline').value.trim(),
      bio:       document.getElementById('edit-bio').value.trim(),
      email:     email,
      phone:     document.getElementById('edit-phone').value.trim(),
      location:  document.getElementById('edit-location').value.trim(),
      github:    document.getElementById('edit-github').value.trim(),
      linkedin:  document.getElementById('edit-linkedin').value.trim(),
      skills:    collectSkills(),
      softSkills: softSkills,
      education: collectEducation()
    };

    saveData(data);

    // Save photo separately (can be large — keep it out of the main object)
    if (currentPhotoBase64) {
      localStorage.setItem('resumeProfilePhoto', currentPhotoBase64);
    } else {
      localStorage.removeItem('resumeProfilePhoto');
    }

    showAlert('save-alert', 'success',
      'Saved! <a href="index.html">View your profile →</a>');
  });
}

/* ----------------------------------------------------------
   Theme switcher
   ---------------------------------------------------------- */
function setupTheme() {
  var saved = localStorage.getItem('resumeTheme') || 'default';
  applyTheme(saved);

  document.querySelectorAll('.theme-swatch').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyTheme(btn.dataset.theme);
      localStorage.setItem('resumeTheme', btn.dataset.theme);
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-swatch').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.theme === theme);
  });
}

/* ----------------------------------------------------------
   Main
   ---------------------------------------------------------- */
(function () {
  var data = loadData();
  populateForm(data);
  setupPhoto();
  setupSkills(data);
  setupEducation(data);
  setupSave();
  setupTheme();
})();
