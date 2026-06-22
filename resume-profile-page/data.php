<?php
/**
 * data.php
 * ----------------------------------------------------------------
 * Handles loading and saving the profile data (personal info,
 * skills, education) to a JSON file on disk. This is what makes
 * the Edit Profile page able to persist changes without a database.
 * ----------------------------------------------------------------
 */

define('DATA_FILE', __DIR__ . '/profile_data.json');
define('UPLOAD_DIR', __DIR__ . '/uploads');
define('UPLOAD_URL', 'uploads'); // relative path used in <img src>

/**
 * Make sure the uploads folder exists (created on first write attempt).
 */
function ensureUploadDir() {
    if (!is_dir(UPLOAD_DIR)) {
        @mkdir(UPLOAD_DIR, 0755, true);
    }
}

function getDefaultData() {
    return [
        'profile' => [
            'name'     => 'Name',
            'title'    => '',
            'tagline'  => '',
            'bio'      => ' '
                         . ''
                         . ' '
                         . '.',
            'email'    => 'user@gmail.com',
            'phone'    => '',
            'photo'    => '',
        ],
        'skills' => [
            ['category' => '0', 'name' => '0',              'level' =>0],

        ],
        'soft_skills' => ['', '', '', ''],
        'education' => [
            [
                'degree'      => '',
                'institution' => '',
                'period'      => '',
                'description' => ' '
                                . ' '
                                . '',
            ],
            [
                'degree'      => '',
                'institution' => '',
                'period'      => '',
                'description' => '',
            ],
        ],
    ];
}

function loadData() {
    if (file_exists(DATA_FILE)) {
        $json = file_get_contents(DATA_FILE);
        $decoded = json_decode($json, true);
        if (is_array($decoded)) {
            return $decoded;
        }
    }
    return getDefaultData();
}

function saveData($data) {
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    return file_put_contents(DATA_FILE, $json, LOCK_EX) !== false;
}

/**
 * Handles a profile photo upload from $_FILES['photo'].
 * Returns the relative URL (e.g. "uploads/xxx.jpg") on success,
 * null if no file was uploaded, or throws by adding to $errors on failure.
 *
 * $currentPhoto is the existing photo path (so it can be deleted on replace).
 */
function handlePhotoUpload($currentPhoto, array &$errors) {
    if (!isset($_FILES['photo']) || $_FILES['photo']['error'] === UPLOAD_ERR_NO_FILE) {
        return null; // no new file selected, keep existing photo
    }

    $file = $_FILES['photo'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errors[] = 'Photo upload failed (error code ' . $file['error'] . ').';
        return null;
    }

    $maxBytes = 4 * 1024 * 1024; // 4MB
    if ($file['size'] > $maxBytes) {
        $errors[] = 'Photo is too large (max 4MB).';
        return null;
    }

    $allowed = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
    ];

    // Verify it's actually an image (not just a renamed file) and get real mime type
    $imageInfo = @getimagesize($file['tmp_name']);
    if ($imageInfo === false || !isset($allowed[$imageInfo['mime']])) {
        $errors[] = 'Photo must be a JPG, PNG, WEBP, or GIF image.';
        return null;
    }

    $ext = $allowed[$imageInfo['mime']];
    ensureUploadDir();

    $filename = 'profile_' . bin2hex(random_bytes(8)) . '.' . $ext;
    $destination = UPLOAD_DIR . '/' . $filename;

    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        $errors[] = 'Could not save the uploaded photo — check that the uploads folder is writable.';
        return null;
    }

    // Clean up the old photo file if it was a previously uploaded one
    if (!empty($currentPhoto)) {
        $oldPath = __DIR__ . '/' . $currentPhoto;
        if (strpos($currentPhoto, UPLOAD_URL . '/') === 0 && is_file($oldPath)) {
            @unlink($oldPath);
        }
    }

    return UPLOAD_URL . '/' . $filename;
}