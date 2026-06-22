// Handles dynamic add/remove rows on the Edit Profile page.
// Page still degrades gracefully without JS: existing rows can still be
// edited and submitted, you just can't add brand-new rows.

(function () {
  function wireRemoveButtons(container) {
    container.querySelectorAll('.remove-row-btn').forEach(function (btn) {
      if (btn.dataset.wired) return;
      btn.dataset.wired = '1';
      btn.addEventListener('click', function () {
        btn.closest('.repeat-row').remove();
      });
    });
  }

  function setupRepeater(rowsId, addBtnId, templateId) {
    var rows = document.getElementById(rowsId);
    var addBtn = document.getElementById(addBtnId);
    var template = document.getElementById(templateId);
    if (!rows || !addBtn || !template) return;

    wireRemoveButtons(rows);

    addBtn.addEventListener('click', function () {
      var clone = template.content.cloneNode(true);
      rows.appendChild(clone);
      wireRemoveButtons(rows);
      var newRow = rows.lastElementChild;
      var firstInput = newRow.querySelector('input');
      if (firstInput) firstInput.focus();
    });
  }

  setupRepeater('skills-rows', 'add-skill-btn', 'skill-row-template');
  setupRepeater('education-rows', 'add-education-btn', 'education-row-template');
})();
