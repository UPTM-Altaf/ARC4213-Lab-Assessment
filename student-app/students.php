<?php
header('Content-Type: application/json');

$dataFile = __DIR__ . '/students.json';

function loadStudents($file) {
    if (!file_exists($file)) {
        $seed = [
            ['id' => 'UPTM2301', 'name' => 'Hana Humaira', 'programme' => 'Diploma in Cybersecurity', 'semester' => '5', 'email' => 'hana@student.com', 'status' => 'active'],
            ['id' => 'UPTM2302', 'name' => 'Lim Wei', 'programme' => 'Diploma in Cybersecurity', 'semester' => '5', 'email' => 'limwei@student.com', 'status' => 'active'],
            ['id' => 'UPTM1350', 'name' => 'Arvind Kumar', 'programme' => 'Bachelor of Information Technology in Cyber Security', 'semester' => '8', 'email' => 'arvind@student.com', 'status' => 'inactive'],
        ];
        file_put_contents($file, json_encode($seed, JSON_PRETTY_PRINT));
        return $seed;
    }
    $json = file_get_contents($file);
    $data = json_decode($json, true);
    return is_array($data) ? $data : [];
}

function saveStudents($file, $students) {
    file_put_contents($file, json_encode($students, JSON_PRETTY_PRINT));
}

$method = $_SERVER['REQUEST_METHOD'];
$students = loadStudents($dataFile);

if ($method === 'GET') {
    echo json_encode(['success' => true, 'data' => $students]);
    exit;
}

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';

    if ($action === 'add') {
        $sid = trim($input['id'] ?? '');
        $name = trim($input['name'] ?? '');
        $programme = trim($input['programme'] ?? '');

        if ($sid === '' || $name === '' || $programme === '') {
            echo json_encode(['success' => false, 'message' => 'Student ID, name, and programme are required.']);
            exit;
        }
        foreach ($students as $s) {
            if (strcasecmp($s['id'], $sid) === 0) {
                echo json_encode(['success' => false, 'message' => 'This Student ID already exists.']);
                exit;
            }
        }
        $students[] = [
            'id' => $sid,
            'name' => $name,
            'programme' => $programme,
            'semester' => trim($input['semester'] ?? ''),
            'email' => trim($input['email'] ?? ''),
            'status' => ($input['status'] ?? 'active') === 'inactive' ? 'inactive' : 'active',
        ];
        saveStudents($dataFile, $students);
        echo json_encode(['success' => true, 'data' => $students]);
        exit;
    }

    if ($action === 'edit') {
        $sid = trim($input['id'] ?? '');
        $found = false;
        foreach ($students as &$s) {
            if ($s['id'] === $sid) {
                $s['name'] = trim($input['name'] ?? $s['name']);
                $s['programme'] = trim($input['programme'] ?? $s['programme']);
                $s['semester'] = trim($input['semester'] ?? $s['semester']);
                $s['email'] = trim($input['email'] ?? $s['email']);
                $s['status'] = ($input['status'] ?? $s['status']) === 'inactive' ? 'inactive' : 'active';
                $found = true;
                break;
            }
        }
        unset($s);
        if (!$found) {
            echo json_encode(['success' => false, 'message' => 'Student not found.']);
            exit;
        }
        saveStudents($dataFile, $students);
        echo json_encode(['success' => true, 'data' => $students]);
        exit;
    }

    if ($action === 'delete') {
        $sid = trim($input['id'] ?? '');
        $students = array_values(array_filter($students, fn($s) => $s['id'] !== $sid));
        saveStudents($dataFile, $students);
        echo json_encode(['success' => true, 'data' => $students]);
        exit;
    }

    echo json_encode(['success' => false, 'message' => 'Unknown action.']);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Method not allowed.']);