<?php
require __DIR__ . '/data.php';
$data = loadData();

$profile     = $data['profile'];
$soft_skills = $data['soft_skills'];
$education   = $data['education'];

// Group the flat skills list back into categories for display
$skills_grouped = [];
foreach ($data['skills'] as $skill) {
    $skills_grouped[$skill['category']][] = $skill;
}

/**
 * ----------------------------------------------------------------
 * Contact form handling (same file processes its own POST request)
 * ----------------------------------------------------------------
 */
$formStatus = null; // 'success' | 'error'
$formErrors = [];
$old = ['name' => '', 'email' => '', 'subject' => '', 'message' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['contact_submit'])) {
    $old['name']    = trim($_POST['name'] ?? '');
    $old['email']   = trim($_POST['email'] ?? '');
    $old['subject'] = trim($_POST['subject'] ?? '');
    $old['message'] = trim($_POST['message'] ?? '');

    if ($old['name'] === '') {
        $formErrors[] = 'Name is required.';
    }
    if ($old['email'] === '' || !filter_var($old['email'], FILTER_VALIDATE_EMAIL)) {
        $formErrors[] = 'A valid email address is required.';
    }
    if ($old['message'] === '') {
        $formErrors[] = 'Message cannot be empty.';
    }

    if (empty($formErrors)) {
        $logLine = sprintf(
            "[%s] %s <%s> (%s): %s\n---\n",
            date('Y-m-d H:i:s'),
            $old['name'],
            $old['email'],
            $old['subject'] !== '' ? $old['subject'] : 'No subject',
            str_replace(["\r", "\n"], ' ', $old['message'])
        );
        @file_put_contents(__DIR__ . '/messages.log', $logLine, FILE_APPEND | LOCK_EX);

        $formStatus = 'success';
        $old = ['name' => '', 'email' => '', 'subject' => '', 'message' => ''];
    } else {
        $formStatus = 'error';
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= htmlspecialchars($profile['name']) ?> — Profile</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
</head>
<body>

<div class="layout">

  <!-- Sidebar: styled as a file explorer for the resume's "sections" -->
  <aside class="sidebar">
    <div class="prompt">RESUME<span class="prompt-at"></span></div>

    <nav class="filetree" aria-label="Section navigation">
      <a href="#profile" class="file active" data-target="profile"><span class="ext"></span>Profile</a>
      <a href="#skills" class="file" data-target="skills"><span class="ext"></span>Skills</a>
      <a href="#education" class="file" data-target="education"><span class="ext"></span>Education</a>
      <a href="#contact" class="file" data-target="contact"><span class="ext"></span>Contact</a>
    </nav>

    <a href="edit.php" class="edit-link">✎ Edit Profile</a>
  </aside>

  <main class="content">

    <!-- ============ PROFILE ============ -->
    <section id="profile" class="panel hero">
      <div class="terminal-frame">
        <div class="terminal-bar">
          <span class="dot dot-red"></span><span class="dot dot-yellow"></span><span class="dot dot-green"></span>
        </div>
        <div class="terminal-photo" aria-hidden="true">
          <?php if (!empty($profile['photo'])): ?>
            <img src="<?= htmlspecialchars($profile['photo']) ?>" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
          <?php else: ?>
          <svg viewBox="0 0 120 120" width="100%" height="100%">
            <circle cx="60" cy="60" r="60" fill="#E7ECF1"/>
            <circle cx="60" cy="48" r="22" fill="#B9C3CE"/>
            <path d="M18 112c4-26 26-40 42-40s38 14 42 40" fill="#B9C3CE"/>
          </svg>
          <?php endif; ?>
        </div>
      </div>

      <div class="hero-text">
        <p class="eyebrow">profile</p>
        <h1><?= htmlspecialchars($profile['name']) ?></h1>
        <p class="role"><?= htmlspecialchars($profile['title']) ?></p>
        <p class="tagline"><?= htmlspecialchars($profile['tagline']) ?></p>
        <p class="bio"><?= htmlspecialchars($profile['bio']) ?></p>

        <ul class="quick-contact">
          <li>📍 <?= htmlspecialchars($profile['location']) ?></li>
          <li>✉️ <a href="mailto:<?= htmlspecialchars($profile['email']) ?>"><?= htmlspecialchars($profile['email']) ?></a></li>
          <li>📞 <?= htmlspecialchars($profile['phone']) ?></li>
        </ul>
      </div>
    </section>

    <!-- ============ SKILLS ============ -->
    <section id="skills" class="panel">
      <p class="eyebrow">skills</p>
      <h2>What I work with</h2>

      <?php if (empty($skills_grouped)): ?>
        <p class="empty-note">No skills added yet. <a href="edit.php">Add some →</a></p>
      <?php endif; ?>

      <?php foreach ($skills_grouped as $category => $items): ?>
        <div class="skill-group">
          <h3 class="skill-category"><?= htmlspecialchars($category) ?></h3>
          <?php foreach ($items as $skill): ?>
            <div class="skill-row">
              <div class="skill-row-top">
                <span class="skill-name"><?= htmlspecialchars($skill['name']) ?></span>
                <span class="skill-level"><?= (int) $skill['level'] ?>%</span>
              </div>
              <div class="skill-track">
                <div class="skill-fill" style="width: <?= (int) $skill['level'] ?>%;"></div>
              </div>
            </div>
          <?php endforeach; ?>
        </div>
      <?php endforeach; ?>

      <?php if (!empty($soft_skills)): ?>
        <div class="skill-group">
          <h3 class="skill-category">Core Strengths</h3>
          <div class="tag-row">
            <?php foreach ($soft_skills as $tag): ?>
              <span class="tag"><?= htmlspecialchars($tag) ?></span>
            <?php endforeach; ?>
          </div>
        </div>
      <?php endif; ?>
    </section>

    <!-- ============ EDUCATION ============ -->
    <section id="education" class="panel">
      <p class="eyebrow">education</p>
      <h2>Education timeline</h2>

      <?php if (empty($education)): ?>
        <p class="empty-note">No education entries yet. <a href="edit.php">Add some →</a></p>
      <?php endif; ?>

      <div class="timeline">
        <?php foreach ($education as $entry): ?>
          <div class="timeline-entry">
            <span class="timeline-dot"></span>
            <p class="timeline-period"><?= htmlspecialchars($entry['period']) ?></p>
            <h3><?= htmlspecialchars($entry['degree']) ?></h3>
            <p class="timeline-institution"><?= htmlspecialchars($entry['institution']) ?></p>
            <p class="timeline-description"><?= htmlspecialchars($entry['description']) ?></p>
          </div>
        <?php endforeach; ?>
      </div>
    </section>

    <!-- ============ CONTACT ============ -->
    <section id="contact" class="panel">
      <p class="eyebrow">contact</p>
      <h2>Get in touch</h2>

      <?php if ($formStatus === 'success'): ?>
        <div class="alert alert-success" role="status">
          Message sent. Thanks for reaching out — I'll reply soon.
        </div>
      <?php elseif ($formStatus === 'error'): ?>
        <div class="alert alert-error" role="alert">
          <strong>Could not send your message:</strong>
          <ul>
            <?php foreach ($formErrors as $error): ?>
              <li><?= htmlspecialchars($error) ?></li>
            <?php endforeach; ?>
          </ul>
        </div>
      <?php endif; ?>

      <form class="contact-form" method="POST" action="#contact" novalidate>
        <div class="form-row">
          <div class="form-field">
            <label for="name">Name</label>
            <input type="text" id="name" name="name" value="<?= htmlspecialchars($old['name']) ?>" required>
          </div>
          <div class="form-field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" value="<?= htmlspecialchars($old['email']) ?>" required>
          </div>
        </div>

        <div class="form-field">
          <label for="subject">Subject</label>
          <input type="text" id="subject" name="subject" value="<?= htmlspecialchars($old['subject']) ?>">
        </div>

        <div class="form-field">
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="5" required><?= htmlspecialchars($old['message']) ?></textarea>
        </div>

        <button type="submit" name="contact_submit" value="1" class="btn">Send message</button>
      </form>
    </section>

    <footer class="page-footer">
    </footer>

  </main>
</div>

<script src="assets/script.js"></script>
</body>
</html>