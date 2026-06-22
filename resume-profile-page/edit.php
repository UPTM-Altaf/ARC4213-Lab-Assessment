<?php
require __DIR__ . '/data.php';
$data = loadData();

$saved = false;
$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // ---- Personal info ----
    $profile = [
        'name'     => trim($_POST['name'] ?? ''),
        'title'    => trim($_POST['title'] ?? ''),
        'tagline'  => trim($_POST['tagline'] ?? ''),
        'bio'      => trim($_POST['bio'] ?? ''),
        'email'    => trim($_POST['email'] ?? ''),
        'phone'    => trim($_POST['phone'] ?? ''),
        'location' => trim($_POST['location'] ?? ''),
        'github'   => trim($_POST['github'] ?? ''),
        'linkedin' => trim($_POST['linkedin'] ?? ''),
        'photo'    => $data['profile']['photo'] ?? '',
    ];

    // ---- Profile photo (upload / remove) ----
    if (isset($_POST['remove_photo']) && $_POST['remove_photo'] === '1') {
        $existing = $profile['photo'];
        if (!empty($existing) && strpos($existing, UPLOAD_URL . '/') === 0) {
            @unlink(__DIR__ . '/' . $existing);
        }
        $profile['photo'] = '';
    }

    $uploadedPhoto = handlePhotoUpload($profile['photo'], $errors);
    if ($uploadedPhoto !== null) {
        $profile['photo'] = $uploadedPhoto;
    }

    if ($profile['name'] === '') {
        $errors[] = 'Name is required.';
    }
    if ($profile['email'] === '' || !filter_var($profile['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'A valid email address is required.';
    }

    // ---- Skills (repeated rows: skill_category[], skill_name[], skill_level[]) ----
    $skills = [];
    $categories = $_POST['skill_category'] ?? [];
    $names      = $_POST['skill_name'] ?? [];
    $levels     = $_POST['skill_level'] ?? [];

    for ($i = 0; $i < count($names); $i++) {
        $name = trim($names[$i] ?? '');
        if ($name === '') {
            continue; // skip empty rows (e.g. user clicked "+ Add skill" then left it blank)
        }
        $level = isset($levels[$i]) && $levels[$i] !== '' ? (int) $levels[$i] : 50;
        $level = max(0, min(100, $level)); // clamp to 0-100

        $skills[] = [
            'category' => trim($categories[$i] ?? '') !== '' ? trim($categories[$i]) : 'Other',
            'name'     => $name,
            'level'    => $level,
        ];
    }

    // ---- Soft skills (comma separated text input -> array) ----
    $soft_skills_raw = trim($_POST['soft_skills'] ?? '');
    $soft_skills = [];
    if ($soft_skills_raw !== '') {
        foreach (explode(',', $soft_skills_raw) as $tag) {
            $tag = trim($tag);
            if ($tag !== '') {
                $soft_skills[] = $tag;
            }
        }
    }

    // ---- Education (repeated rows) ----
    $education = [];
    $degrees      = $_POST['edu_degree'] ?? [];
    $institutions = $_POST['edu_institution'] ?? [];
    $periods      = $_POST['edu_period'] ?? [];
    $descriptions = $_POST['edu_description'] ?? [];

    for ($i = 0; $i < count($degrees); $i++) {
        $degree = trim($degrees[$i] ?? '');
        if ($degree === '') {
            continue;
        }
        $education[] = [
            'degree'      => $degree,
            'institution' => trim($institutions[$i] ?? ''),
            'period'      => trim($periods[$i] ?? ''),
            'description' => trim($descriptions[$i] ?? ''),
        ];
    }

    if (empty($errors)) {
        $newData = [
            'profile'     => $profile,
            'skills'      => $skills,
            'soft_skills' => $soft_skills,
            'education'   => $education,
        ];

        if (saveData($newData)) {
            $data = $newData;
            $saved = true;
        } else {
            $errors[] = 'Could not save changes — check that the folder is writable.';
        }
    }
}

$profile     = $data['profile'];
$skills      = $data['skills'];
$soft_skills = $data['soft_skills'];
$education   = $data['education'];
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Edit Profile</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>

<div class="layout">

  <aside class="sidebar">
    <div class="prompt">RESUME<span class="prompt-at"></div>
    <nav class="filetree" aria-label="Section navigation">
      <a href="index.php" class="file"><span class="ext"></span>View Profile</a>
      <a href="edit.php" class="file active"><span class="ext"></span>Edit Profile</a>
    </nav>
  </aside>

  <main class="content">

    <section class="panel in-view edit-page">
      <p class="eyebrow">Edit</p>
      <h2>Edit your profile</h2>

      <?php if ($saved): ?>
        <div class="alert alert-success" role="status">
          Saved! <a href="index.php">View your profile →</a>
        </div>
      <?php elseif (!empty($errors)): ?>
        <div class="alert alert-error" role="alert">
          <strong>Could not save:</strong>
          <ul>
            <?php foreach ($errors as $error): ?>
              <li><?= htmlspecialchars($error) ?></li>
            <?php endforeach; ?>
          </ul>
        </div>
      <?php endif; ?>

      <form method="POST" action="edit.php" id="edit-form" enctype="multipart/form-data">

        <!-- ===== Personal Information ===== -->
        <h3 class="form-section-title">Personal Information</h3>

        <div class="form-field photo-field">
          <label>Profile Photo</label>
          <div class="photo-edit-row">
            <div class="photo-preview" id="photo-preview">
              <?php if (!empty($profile['photo'])): ?>
                <img src="<?= htmlspecialchars($profile['photo']) ?>" alt="Current profile photo" id="photo-preview-img">
              <?php else: ?>
                <svg viewBox="0 0 120 120" width="100%" height="100%" id="photo-preview-placeholder">
                  <circle cx="60" cy="60" r="60" fill="#E7ECF1"/>
                  <circle cx="60" cy="48" r="22" fill="#B9C3CE"/>
                  <path d="M18 112c4-26 26-40 42-40s38 14 42 40" fill="#B9C3CE"/>
                </svg>
                <img src="" alt="" id="photo-preview-img" style="display:none;">
              <?php endif; ?>
            </div>
            <div class="photo-edit-controls">
              <input type="file" id="photo" name="photo" accept="image/png,image/jpeg,image/webp,image/gif">
              <p class="form-hint" style="margin:8px 0 0;">JPG, PNG, WEBP, or GIF. Max 4MB.</p>
              <?php if (!empty($profile['photo'])): ?>
                <button type="button" id="remove-photo-btn" class="remove-photo-btn">✕ Remove current photo</button>
                <input type="checkbox" name="remove_photo" value="1" id="remove_photo" hidden>
              <?php endif; ?>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="name">Full Name</label>
            <input type="text" id="name" name="name" value="<?= htmlspecialchars($profile['name']) ?>" required>
          </div>
          <div class="form-field">
            <label for="title">Title / Role</label>
            <input type="text" id="title" name="title" value="<?= htmlspecialchars($profile['title']) ?>">
          </div>
        </div>

        <div class="form-field">
          <label for="tagline">Tagline (one short sentence)</label>
          <input type="text" id="tagline" name="tagline" value="<?= htmlspecialchars($profile['tagline']) ?>">
        </div>

        <div class="form-field">
          <label for="bio">Bio</label>
          <textarea id="bio" name="bio" rows="4"><?= htmlspecialchars($profile['bio']) ?></textarea>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" value="<?= htmlspecialchars($profile['email']) ?>" required>
          </div>
          <div class="form-field">
            <label for="phone">Phone</label>
            <input type="text" id="phone" name="phone" value="<?= htmlspecialchars($profile['phone']) ?>">
          </div>
        </div>

        <div class="form-row">
          <div class="form-field">
            <label for="location">Location</label>
            <input type="text" id="location" name="location" value="<?= htmlspecialchars($profile['location']) ?>">
          </div>
          <div class="form-field">
            <label for="github">GitHub URL</label>
            <input type="text" id="github" name="github" value="<?= htmlspecialchars($profile['github']) ?>">
          </div>
        </div>

        <div class="form-field">
          <label for="linkedin">LinkedIn URL</label>
          <input type="text" id="linkedin" name="linkedin" value="<?= htmlspecialchars($profile['linkedin']) ?>">
        </div>

        <!-- ===== Skills ===== -->
        <h3 class="form-section-title">Skills</h3>
        <p class="form-hint">Add as many skills as you like. Category groups skills together on your profile (e.g. "Languages", "Tools"). Leave the skill name blank to drop a row.</p>

        <div id="skills-rows">
          <?php foreach ($skills as $skill): ?>
            <div class="repeat-row skill-input-row">
              <input type="text" name="skill_category[]" placeholder="Category (e.g. Languages)" value="<?= htmlspecialchars($skill['category']) ?>">
              <input type="text" name="skill_name[]" placeholder="Skill name" value="<?= htmlspecialchars($skill['name']) ?>">
              <input type="number" name="skill_level[]" placeholder="0-100" min="0" max="100" value="<?= (int) $skill['level'] ?>">
              <button type="button" class="remove-row-btn" title="Remove">✕</button>
            </div>
          <?php endforeach; ?>
        </div>
        <button type="button" id="add-skill-btn" class="btn-secondary">+ Add skill</button>

        <div class="form-field" style="margin-top: 20px;">
          <label for="soft_skills">Core strengths (comma-separated)</label>
          <input type="text" id="soft_skills" name="soft_skills"
                 value="<?= htmlspecialchars(implode(', ', $soft_skills)) ?>"
                 placeholder="Teamwork, Problem Solving, Time Management">
        </div>

        <!-- ===== Education ===== -->
        <h3 class="form-section-title">Education</h3>

        <div id="education-rows">
          <?php foreach ($education as $entry): ?>
            <div class="repeat-row education-input-row">
              <div class="form-row">
                <input type="text" name="edu_degree[]" placeholder="Degree / Qualification" value="<?= htmlspecialchars($entry['degree']) ?>">
                <input type="text" name="edu_period[]" placeholder="Period (e.g. 2023 - Present)" value="<?= htmlspecialchars($entry['period']) ?>">
              </div>
              <input type="text" name="edu_institution[]" placeholder="Institution" value="<?= htmlspecialchars($entry['institution']) ?>">
              <textarea name="edu_description[]" placeholder="Short description" rows="2"><?= htmlspecialchars($entry['description']) ?></textarea>
              <button type="button" class="remove-row-btn" title="Remove">✕ Remove entry</button>
            </div>
          <?php endforeach; ?>
        </div>
        <button type="button" id="add-education-btn" class="btn-secondary">+ Add education entry</button>

        <div class="form-actions">
          <button type="submit" class="btn">Save changes</button>
          <a href="index.php" class="btn-cancel">Cancel</a>
        </div>
      </form>
    </section>

  </main>
</div>

<!-- Hidden templates used by JS to clone new rows -->
<template id="skill-row-template">
  <div class="repeat-row skill-input-row">
    <input type="text" name="skill_category[]" placeholder="Category (e.g. Languages)">
    <input type="text" name="skill_name[]" placeholder="Skill name">
    <input type="number" name="skill_level[]" placeholder="0-100" min="0" max="100" value="50">
    <button type="button" class="remove-row-btn" title="Remove">✕</button>
  </div>
</template>

<template id="education-row-template">
  <div class="repeat-row education-input-row">
    <div class="form-row">
      <input type="text" name="edu_degree[]" placeholder="Degree / Qualification">
      <input type="text" name="edu_period[]" placeholder="Period (e.g. 2023 - Present)">
    </div>
    <input type="text" name="edu_institution[]" placeholder="Institution">
    <textarea name="edu_description[]" placeholder="Short description" rows="2"></textarea>
    <button type="button" class="remove-row-btn" title="Remove">✕ Remove entry</button>
  </div>
</template>

<script src="assets/edit.js"></script>
<script>
(function () {
  var fileInput = document.getElementById('photo');
  var previewImg = document.getElementById('photo-preview-img');
  var placeholder = document.getElementById('photo-preview-placeholder');
  var removeCheckbox = document.getElementById('remove_photo');
  var removeBtn = document.getElementById('remove-photo-btn');
  var originalSrc = previewImg ? previewImg.src : '';

  if (fileInput && previewImg) {
    fileInput.addEventListener('change', function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function (e) {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
        if (removeCheckbox) removeCheckbox.checked = false;
        if (removeBtn) removeBtn.classList.remove('is-active');
      };
      reader.readAsDataURL(file);
    });
  }

  if (removeBtn && removeCheckbox) {
    removeBtn.addEventListener('click', function () {
      var nowRemoving = !removeCheckbox.checked;
      removeCheckbox.checked = nowRemoving;
      removeBtn.classList.toggle('is-active', nowRemoving);
      removeBtn.textContent = nowRemoving ? '↺ Undo remove' : '✕ Remove current photo';

      if (nowRemoving) {
        // Clear any pending file selection and show placeholder
        fileInput.value = '';
        previewImg.style.display = 'none';
        if (placeholder) placeholder.style.display = 'block';
      } else {
        // Restore original photo preview
        previewImg.src = originalSrc;
        previewImg.style.display = 'block';
        if (placeholder) placeholder.style.display = 'none';
      }
    });
  }
})();
</script>
</body>
</html>