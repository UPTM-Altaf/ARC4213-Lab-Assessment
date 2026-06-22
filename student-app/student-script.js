(function(){
  const API_URL = 'students.php';
  const AVATAR_COLORS = ['#0F5257', '#8B5E34', '#4A5577', '#6E7F4F', '#9C5B5B'];
  let students = [];
  let editingId = null;
  let filterText = '';
  let filterStatus = 'all';

  const tableBody = document.getElementById('tableBody');
  const emptyState = document.getElementById('emptyState');
  const studentTable = document.getElementById('studentTable');
  const countPill = document.getElementById('countPill');
  const form = document.getElementById('studentForm');
  const modalTitle = document.getElementById('modalTitle');
  const modalSub = document.getElementById('modalSub');
  const statTotal = document.getElementById('statTotal');
  const statActive = document.getElementById('statActive');
  const statInactive = document.getElementById('statInactive');

  const studentModalEl = document.getElementById('studentModal');
  const studentModal = new bootstrap.Modal(studentModalEl);
  const liveToastEl = document.getElementById('liveToast');
  const liveToast = new bootstrap.Toast(liveToastEl, {delay:2200});
  const toastMsg = document.getElementById('toastMsg');

  async function fetchStudents(){
    try{
      const res = await fetch(API_URL);
      const json = await res.json();
      students = json.data || [];
      render();
    }catch(err){
      showToast('Could not reach the server. Is Apache running?');
    }
  }

  async function apiCall(payload){
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    return res.json();
  }

  function showToast(msg){
    toastMsg.textContent = msg;
    liveToast.show();
  }

  function avatarColor(name){
    const code = name.trim().charCodeAt(0) || 0;
    return AVATAR_COLORS[code % AVATAR_COLORS.length];
  }
  function initials(name){
    const parts = name.trim().split(/\s+/);
    const first = parts[0] ? parts[0][0] : '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  function filteredStudents(){
    return students.filter(s=>{
      const matchesText = !filterText ||
        s.name.toLowerCase().includes(filterText) ||
        s.id.toLowerCase().includes(filterText);
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
      return matchesText && matchesStatus;
    });
  }

  function updateStats(){
    const total = students.length;
    const active = students.filter(s => s.status === 'active').length;
    statTotal.textContent = total;
    statActive.textContent = active;
    statInactive.textContent = total - active;
  }

  function render(){
    updateStats();
    const list = filteredStudents();
    countPill.textContent = students.length + (students.length === 1 ? ' student' : ' students') +
      (list.length !== students.length ? ` · ${list.length} shown` : '');

    if(students.length === 0){
      studentTable.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }
    studentTable.style.display = 'table';
    emptyState.style.display = list.length ? 'none' : 'block';
    if(!list.length){
      emptyState.querySelector('h3').textContent = 'No matches';
      emptyState.querySelector('p').textContent = 'Try a different search or filter.';
      emptyState.querySelector('button').style.display = 'none';
    }

    tableBody.innerHTML = list.map(s => `
      <tr data-id="${escapeAttr(s.id)}">
        <td><span class="sid">${escapeHtml(s.id)}</span></td>
        <td>
          <div class="row-name">
            <div class="avatar" style="background:${avatarColor(s.name)}">${initials(s.name)}</div>
            <div>
              <div class="fw-semibold">${escapeHtml(s.name)}</div>
              <div class="text-muted small">${escapeHtml(s.email||'—')}</div>
            </div>
          </div>
        </td>
        <td>${escapeHtml(s.programme)}</td>
        <td>${escapeHtml(s.semester||'—')}</td>
        <td><span class="badge rounded-pill text-bg-${s.status === 'active' ? 'success' : 'danger'}">${s.status === 'active' ? 'Active' : 'Inactive'}</span></td>
        <td class="text-end">
          <button class="btn btn-sm btn-light" data-action="edit" data-id="${escapeAttr(s.id)}">Edit</button>
          <button class="btn btn-sm btn-light text-danger" data-action="delete" data-id="${escapeAttr(s.id)}">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function escapeAttr(str){ return escapeHtml(str); }

  function openModal(student){
    form.reset();
    clearErrors();
    if(student){
      editingId = student.id;
      modalTitle.textContent = 'Edit student';
      modalSub.textContent = `Updating record for ${student.name}.`;
      form.sid.value = student.id;
      form.sid.disabled = true;
      form.name.value = student.name;
      form.programme.value = student.programme;
      form.semester.value = student.semester || '';
      form.email.value = student.email || '';
      form.status.value = student.status;
    } else {
      editingId = null;
      modalTitle.textContent = 'Add student';
      modalSub.textContent = "Enter the student's details below.";
      form.sid.disabled = false;
      form.status.value = 'active';
    }
    studentModal.show();
  }
  function clearErrors(){
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  }
  function setError(fieldId){
    document.getElementById(fieldId).classList.add('is-invalid');
  }

  function validateClientSide(data){
    clearErrors();
    let valid = true;
    if(!data.id.trim()){ setError('sid'); valid = false; }
    if(!data.name.trim()){ setError('name'); valid = false; }
    if(!data.programme.trim()){ setError('programme'); valid = false; }
    if(data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)){ setError('email'); valid = false; }
    return valid;
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const data = {
      id: form.sid.value,
      name: form.name.value,
      programme: form.programme.value,
      semester: form.semester.value,
      email: form.email.value,
      status: form.status.value
    };
    if(!validateClientSide(data)) return;

    const action = editingId ? 'edit' : 'add';
    const result = await apiCall({action, ...data});

    if(!result.success){
      if(result.message && result.message.includes('already exists')){
        setError('sid');
        document.querySelector('#sid + .invalid-feedback').textContent = result.message;
      } else {
        showToast(result.message || 'Something went wrong.');
      }
      return;
    }

    students = result.data;
    showToast(editingId ? 'Student updated.' : 'Student added.');
    studentModal.hide();
    render();
  });

  // Explicit Add-button handlers — always reset the modal to "Add" state
  document.getElementById('openAddBtn').addEventListener('click', () => openModal(null));
  document.getElementById('emptyAddBtn').addEventListener('click', () => openModal(null));

  studentModalEl.addEventListener('hidden.bs.modal', function(){
    editingId = null;
    clearErrors();
    form.reset();
  });

  tableBody.addEventListener('click', async function(e){
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const id = btn.dataset.id;
    const student = students.find(s => s.id === id);
    if(btn.dataset.action === 'edit'){
      openModal(student);
    } else if(btn.dataset.action === 'delete'){
      if(confirm(`Delete record for ${student.name}? This cannot be undone.`)){
        const result = await apiCall({action: 'delete', id});
        students = result.data || students;
        render();
        showToast('Student deleted.');
      }
    }
  });

  document.getElementById('searchInput').addEventListener('input', function(e){
    filterText = e.target.value.trim().toLowerCase();
    render();
  });
  document.getElementById('statusFilter').addEventListener('change', function(e){
    filterStatus = e.target.value;
    render();
  });

  fetchStudents();
})();