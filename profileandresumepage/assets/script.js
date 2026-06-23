/* ==========================================================
   script.js — Profile page (index.html)
   Reads data from localStorage and populates the page.
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
    {
      degree:      '',
      institution: '',
      period:      '',
      description: ''
    }
  ]
};

function loadData() {
  try {
    var saved = localStorage.getItem('resumeProfileData');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) { /* ignore */ }
  return DEFAULT_DATA;
}

function setText(id, value) {
  var el = document.getElementById(id);
  if (el) el.textContent = value;
}

function renderPhoto(data) {
  var placeholder = document.getElementById('photo-placeholder');
  var img         = document.getElementById('profile-photo-img');
  if (!placeholder || !img) return;

  var photo = localStorage.getItem('resumeProfilePhoto') || data.photo || '';

  if (photo) {
    img.src = photo;
    img.alt = 'Photo of ' + data.name;
    img.classList.remove('hidden');
    placeholder.classList.add('hidden');
  } else {
    img.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }
}

function renderSkills(data) {
  var container = document.getElementById('skills-display');
  if (!container) return;

  var grouped = {};
  (data.skills || []).forEach(function (skill) {
    var cat = skill.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(skill);
  });

  var html = '';
  Object.keys(grouped).forEach(function (cat) {
    html += '<div class="skill-group"><h3 class="skill-category">' + esc(cat) + '</h3>';
    grouped[cat].forEach(function (skill) {
      var lvl = Math.max(0, Math.min(100, parseInt(skill.level) || 0));
      html += '<div class="skill-row">'
            +   '<div class="skill-row-top">'
            +     '<span class="skill-name">' + esc(skill.name) + '</span>'
            +     '<span class="skill-level">' + lvl + '%</span>'
            +   '</div>'
            +   '<div class="skill-track"><div class="skill-fill" style="width:' + lvl + '%"></div></div>'
            + '</div>';
    });
    html += '</div>';
  });

  if (data.softSkills && data.softSkills.length) {
    html += '<div class="skill-group"><h3 class="skill-category">Core Strengths</h3><div class="tag-row">';
    data.softSkills.forEach(function (tag) {
      html += '<span class="tag">' + esc(tag) + '</span>';
    });
    html += '</div></div>';
  }

  container.innerHTML = html || '<p class="empty-note">No skills added yet. <a href="edit.html">Add some →</a></p>';
}

function renderEducation(data) {
  var container = document.getElementById('education-display');
  if (!container) return;

  var html = '';
  (data.education || []).forEach(function (entry) {
    html += '<div class="timeline-entry">'
          +   '<span class="timeline-dot"></span>'
          +   '<p class="timeline-period">' + esc(entry.period) + '</p>'
          +   '<h3>' + esc(entry.degree) + '</h3>'
          +   '<p class="timeline-institution">' + esc(entry.institution) + '</p>'
          +   '<p class="timeline-description">' + esc(entry.description) + '</p>'
          + '</div>';
  });

  container.innerHTML = html || '<p class="empty-note">No education entries yet. <a href="edit.html">Add some →</a></p>';
}

function setupContactForm(data) {
  var btn   = document.getElementById('contact-send-btn');
  var alert = document.getElementById('contact-alert');
  if (!btn) return;

  btn.addEventListener('click', function () {
    var name    = document.getElementById('msg-name').value.trim();
    var email   = document.getElementById('msg-email').value.trim();
    var message = document.getElementById('msg-message').value.trim();
    var errors  = [];

    if (!name)    errors.push('Name is required.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email is required.');
    if (!message) errors.push('Message cannot be empty.');

    if (errors.length) {
      alert.className = 'alert alert-error';
      alert.innerHTML = '<strong>Could not send:</strong><ul>' + errors.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>';
    } else {
      // Store the message in localStorage for demo purposes (shows it was received)
      var messages = JSON.parse(localStorage.getItem('resumeMessages') || '[]');
      messages.push({
        from: name,
        email: email,
        subject: document.getElementById('msg-subject').value.trim(),
        message: message,
        date: new Date().toLocaleString()
      });
      localStorage.setItem('resumeMessages', JSON.stringify(messages));

      alert.className = 'alert alert-success';
      alert.textContent = 'Message sent! Thanks for reaching out — I\'ll reply soon.';
      document.getElementById('msg-name').value    = '';
      document.getElementById('msg-email').value   = '';
      document.getElementById('msg-subject').value = '';
      document.getElementById('msg-message').value = '';
    }

    alert.classList.remove('hidden');
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

function setupScrollNav() {
  var panels   = document.querySelectorAll('.panel');
  var navLinks = document.querySelectorAll('.filetree .file');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!('IntersectionObserver' in window)) {
    panels.forEach(function (p) { p.classList.add('in-view'); });
    return;
  }

  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('in-view'); });
  }, { threshold: 0.12 });

  var navObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        navLinks.forEach(function (l) {
          l.classList.toggle('active', l.dataset.target === e.target.id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px' });

  panels.forEach(function (p) {
    if (reduceMotion) p.classList.add('in-view'); else revealObs.observe(p);
    navObs.observe(p);
  });
}

function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
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

// ---- Main ----
(function () {
  var data = loadData();

  // Update page title
  document.title = data.name + ' — Profile';

  // Personal info
  setText('hero-name',     data.name);
  setText('hero-title',    data.title);
  setText('hero-tagline',  data.tagline);
  setText('hero-bio',      data.bio);
  setText('contact-location', '📍 ' + data.location);
  setText('contact-phone',    '📞 ' + data.phone);

  var emailEl = document.getElementById('contact-email');
  if (emailEl) { emailEl.textContent = data.email; emailEl.href = 'mailto:' + data.email; }

  var linkEmail = document.getElementById('link-email');
  if (linkEmail) linkEmail.href = 'mailto:' + data.email;
  var linkGithub = document.getElementById('link-github');
  if (linkGithub) linkGithub.href = data.github;
  var linkLinkedin = document.getElementById('link-linkedin');
  if (linkLinkedin) linkLinkedin.href = data.linkedin;

  renderPhoto(data);
  renderSkills(data);
  renderEducation(data);
  setupContactForm(data);
  setupScrollNav();
  setupTheme();
})();
