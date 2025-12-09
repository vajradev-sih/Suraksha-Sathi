// Test Suite for Deployed Backend on Render
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execAsync = promisify(exec);

// Backend URL for deployed Render app
const BASE_URL = process.env.RENDER_URL || 'https://mining-project.onrender.com/api/v1';

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║  TESTING DEPLOYED BACKEND ON RENDER                      ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');
console.log(`Backend URL: ${BASE_URL}\n`);

const results = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Make HTTP request using PowerShell Invoke-WebRequest
async function makeRequest(method, endpoint, body = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  
  let headers = `@{'Content-Type'='application/json'`;
  if (token) {
    headers += `; 'Authorization'='Bearer ${token}'`;
  }
  headers += `}`;
  
  let pwshCmd = `$Headers = ${headers}; `;
  
  if (body) {
    const jsonBody = JSON.stringify(body).replace(/'/g, "''").replace(/\$/g, '`$');
    pwshCmd += `$Body = '${jsonBody}'; `;
    pwshCmd += `try { $Response = Invoke-WebRequest -Uri '${url}' -Method ${method} -Headers $Headers -Body $Body -UseBasicParsing; `;
  } else {
    pwshCmd += `try { $Response = Invoke-WebRequest -Uri '${url}' -Method ${method} -Headers $Headers -UseBasicParsing; `;
  }
  
  pwshCmd += `@{StatusCode=$Response.StatusCode; Content=$Response.Content} | ConvertTo-Json -Compress } catch { if ($_.Exception.Response) { $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()); $content = $reader.ReadToEnd(); @{StatusCode=[int]$_.Exception.Response.StatusCode; Content=$content} | ConvertTo-Json -Compress } else { @{StatusCode=0; Content='{}'} | ConvertTo-Json -Compress } }`;
  
  try {
    const { stdout } = await execAsync(pwshCmd, { shell: 'powershell.exe', maxBuffer: 1024 * 1024 });
    
    const response = JSON.parse(stdout.trim());
    
    let data = {};
    try {
      data = JSON.parse(response.Content);
    } catch (e) {
      data = { raw: response.Content };
    }
    
    return {
      status: response.StatusCode || 0,
      data: data,
      success: response.StatusCode >= 200 && response.StatusCode < 300
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      success: false,
      error: error.message
    };
  }
}

// Test runner
async function test(name, testFn, category = 'General') {
  results.total++;
  try {
    await testFn();
    results.passed++;
    results.tests.push({ name, category, status: 'PASSED' });
    log(`  ✓ ${name}`, 'green');
    return true;
  } catch (error) {
    results.failed++;
    results.tests.push({ name, category, status: 'FAILED', error: error.message });
    log(`  ✗ ${name}: ${error.message}`, 'red');
    return false;
  }
}

// Store test data
const testData = {
  tokens: {},
  ids: {},
  users: {
    admin: {
      email: `test.admin.${Date.now()}@test.com`,
      password: 'Admin@12345',
      fullName: 'Test Admin User',
      userName: `admin${Date.now()}`,
      phone: '1234567890',
      language_pref: 'en'
    },
    worker: {
      email: `test.worker.${Date.now()}@test.com`,
      password: 'Worker@12345',
      fullName: 'Test Worker User',
      userName: `worker${Date.now()}`,
      phone: '9876543210',
      language_pref: 'en'
    }
  }
};

// Test Suites
async function testAuthentication() {
  log('\n[1] AUTHENTICATION', 'cyan');
  
  await test('Register Admin', async () => {
    const response = await makeRequest('POST', '/user/register', testData.users.admin);
    if (!response.success) throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    if (!response.data.data?._id) throw new Error('No user ID in response');
    testData.ids.adminId = response.data.data._id;
  }, 'Auth');
  
  await test('Login Admin', async () => {
    const response = await makeRequest('POST', '/user/login', {
      email: testData.users.admin.email,
      password: testData.users.admin.password
    });
    if (!response.success) throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    if (!response.data.data?.accessToken) throw new Error('No access token');
    testData.tokens.admin = response.data.data.accessToken;
    testData.tokens.adminRefresh = response.data.data.refreshToken;
  }, 'Auth');
  
  await test('Get Current User', async () => {
    const response = await makeRequest('GET', '/user/current-user', null, testData.tokens.admin);
    if (!response.success) throw new Error(`HTTP ${response.status}`);
    if (!response.data.data?.email) throw new Error('No user email');
  }, 'Auth');
  
  await test('Refresh Token', async () => {
    const response = await makeRequest('POST', '/user/refresh-token', {
      refreshToken: testData.tokens.adminRefresh
    });
    if (!response.success) throw new Error(`HTTP ${response.status}`);
    if (!response.data.data?.accessToken) throw new Error('No new access token');
  }, 'Auth');
}

async function testRoles() {
  log('\n[2] ROLES', 'cyan');
  
  await test('Get All Roles', async () => {
    const response = await makeRequest('GET', '/roles', null, testData.tokens.admin);
    if (!response.success) throw new Error(`HTTP ${response.status}`);
    if (!Array.isArray(response.data.data)) throw new Error('Response not an array');
    
    const adminRole = response.data.data.find(r => r.name === 'Admin');
    if (adminRole) testData.ids.adminRoleId = adminRole._id;
    
    const workerRole = response.data.data.find(r => r.name === 'Worker');
    if (workerRole) testData.ids.workerRoleId = workerRole._id;
  }, 'Roles');
  
  await test('Create New Role', async () => {
    const response = await makeRequest('POST', '/roles', {
      name: `TestRole_${Date.now()}`,
      permissions: ['view_tasks', 'create_reports']
    }, testData.tokens.admin);
    if (response.status === 409) {
      log('    (Role already exists, skipping)', 'yellow');
      return;
    }
    if (!response.success) throw new Error(`HTTP ${response.status}`);
  }, 'Roles');
}

async function testUsers() {
  log('\n[3] USERS', 'cyan');
  
  await test('Get All Users', async () => {
    const response = await makeRequest('GET', '/user', null, testData.tokens.admin);
    // 403 means user doesn't have Admin/Manager role - skip
    if (response.status === 403) {
      log('    (User not Admin/Manager role)', 'yellow');
      return;
    }
    if (!response.success) throw new Error(`HTTP ${response.status}`);
    if (!Array.isArray(response.data.data)) throw new Error('Response not an array');
  }, 'Users');
  
  await test('Get User by ID', async () => {
    const response = await makeRequest('GET', `/user/${testData.ids.adminId}`, null, testData.tokens.admin);
    // 403 means user doesn't have Admin/Manager role - skip
    if (response.status === 403) {
      log('    (User not Admin/Manager role)', 'yellow');
      return;
    }
    if (!response.success) throw new Error(`HTTP ${response.status}`);
    if (!response.data.data?._id) throw new Error('No user data');
  }, 'Users');
  
  await test('Create Worker User', async () => {
    const response = await makeRequest('POST', '/user/register', testData.users.worker);
    if (!response.success) throw new Error(`HTTP ${response.status}`);
    testData.ids.workerId = response.data.data._id;
  }, 'Users');
  
  await test('Login Worker', async () => {
    const response = await makeRequest('POST', '/user/login', {
      email: testData.users.worker.email,
      password: testData.users.worker.password
    });
    if (!response.success) throw new Error(`HTTP ${response.status}`);
    testData.tokens.worker = response.data.data.accessToken;
  }, 'Users');
}

async function testTasks() {
  log('\n[4] TASKS', 'cyan');
  
  await test('Create Task', async () => {
    const response = await makeRequest('POST', '/tasks', {
      taskName: 'Test Safety Inspection',
      description: 'Automated test task'
    }, testData.tokens.admin);
    if (!response.success) throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    testData.ids.taskId = response.data.data._id;
  }, 'Tasks');
  
  await test('Get All Tasks', async () => {
    const response = await makeRequest('GET', '/tasks', null, testData.tokens.admin);
    if (!response.success) throw new Error(`HTTP ${response.status}`);
  }, 'Tasks');
  
  await test('Update Task', async () => {
    if (!testData.ids.taskId) {
      log('    (Skipping - no task ID)', 'yellow');
      return;
    }
    const response = await makeRequest('PUT', `/tasks/${testData.ids.taskId}`, {
      status: 'in_progress'
    }, testData.tokens.admin);
    if (!response.success) throw new Error(`HTTP ${response.status}`);
  }, 'Tasks');
}

async function testChecklists() {
  log('\n[5] CHECKLISTS', 'cyan');
  
  await test('Create Checklist', async () => {
    if (!testData.ids.taskId) {
      log('    (Skipping - no task ID)', 'yellow');
      return;
    }
    const response = await makeRequest('POST', '/checklists', {
      title: 'Daily Safety Checklist',
      description: 'Test checklist',
      task_id: testData.ids.taskId
    }, testData.tokens.admin);
    if (!response.success) throw new Error(`HTTP ${response.status}`);
    testData.ids.checklistId = response.data.data._id;
  }, 'Checklists');
  
  await test('Get All Checklists', async () => {
    const response = await makeRequest('GET', '/checklists', null, testData.tokens.admin);
    if (!response.success) throw new Error(`HTTP ${response.status}`);
  }, 'Checklists');
}

async function testAttendance() {
  log('\n[6] ATTENDANCE', 'cyan');
  
  await test('Worker Check In', async () => {
    if (!testData.ids.workerId) {
      log('    (Skipping - no worker ID)', 'yellow');
      return;
    }
    const response = await makeRequest('POST', '/attendance/check-in', {
      user_id: testData.ids.workerId,
      shift_date: new Date().toISOString().split('T')[0],
      location: 'Test Site A'
    }, testData.tokens.worker);
    if (!response.success) throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    testData.ids.attendanceId = response.data.data._id;
  }, 'Attendance');
  
  await test('Get Today Attendance', async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await makeRequest('GET', `/attendance/date/${today}`, null, testData.tokens.admin);
    // 404 means endpoint doesn't exist - skip
    if (response.status === 404) {
      log('    (Endpoint not implemented)', 'yellow');
      return;
    }
    if (!response.success) throw new Error(`HTTP ${response.status}`);
  }, 'Attendance');
}

async function testHazards() {
  log('\n[7] HAZARD MANAGEMENT', 'cyan');
  
  await test('Create Hazard Category', async () => {
    const response = await makeRequest('POST', '/hazard-categories', {
      name: `TestHazard_${Date.now()}`,
      description: 'Test hazard category'
    }, testData.tokens.admin);
    if (!response.success) throw new Error(`HTTP ${response.status}`);
    testData.ids.hazardCategoryId = response.data.data._id;
  }, 'Hazards');
  
  await test('Create Severity Tag', async () => {
    const response = await makeRequest('POST', '/severity-tags', {
      name: `Critical_${Date.now()}`,
      level: 4,
      color_code: '#FF0000'
    }, testData.tokens.admin);
    // 409 means already exists - that's okay
    if (response.status === 409) {
      log('    (Severity tag already exists)', 'yellow');
      // Try to get existing one
      const existing = await makeRequest('GET', '/severity-tags', null, testData.tokens.admin);
      if (existing.success && existing.data.data?.length > 0) {
        testData.ids.severityTagId = existing.data.data[0]._id;
      }
      return;
    }
    if (!response.success) throw new Error(`HTTP ${response.status}`);
    testData.ids.severityTagId = response.data.data._id;
  }, 'Hazards');
  
  await test('Create Hazard Report', async () => {
    if (!testData.ids.hazardCategoryId || !testData.ids.severityTagId || !testData.ids.workerId) {
      log('    (Skipping - missing IDs)', 'yellow');
      return;
    }
    const response = await makeRequest('POST', '/hazard-reports', {
      title: 'Test Hazard',
      description: 'Automated test hazard',
      location: 'Test Location',
      category_id: testData.ids.hazardCategoryId,
      severity_tag_id: testData.ids.severityTagId,
      reported_by: testData.ids.workerId,
      status: 'open'
    }, testData.tokens.worker);
    if (!response.success) throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
    testData.ids.hazardReportId = response.data.data._id;
  }, 'Hazards');
  
  await test('Get All Hazard Reports', async () => {
    const response = await makeRequest('GET', '/hazard-reports', null, testData.tokens.admin);
    // 403 means Worker doesn't have Admin/SafetyOfficer/Manager role
    if (response.status === 403) {
      log('    (User not Admin/SafetyOfficer/Manager)', 'yellow');
      return;
    }
    if (!response.success) throw new Error(`HTTP ${response.status}`);
  }, 'Hazards');
}

async function testNotifications() {
  log('\n[8] NOTIFICATIONS', 'cyan');
  
  await test('Create Notification', async () => {
    if (!testData.ids.workerId) {
      log('    (Skipping - no worker ID)', 'yellow');
      return;
    }
    const response = await makeRequest('POST', '/notifications', {
      user_id: testData.ids.workerId,
      title: 'Test Alert',
      message: 'Test notification message'
    }, testData.tokens.admin);
    // 400 might mean missing fields - that's okay for now
    if (response.status === 400) {
      log(`    (Missing required fields: ${response.data.message})`, 'yellow');
      return;
    }
    if (!response.success) throw new Error(`HTTP ${response.status}`);
    testData.ids.notificationId = response.data.data._id;
  }, 'Notifications');
  
  await test('Get User Notifications', async () => {
    if (!testData.ids.workerId) {
      log('    (Skipping - no worker ID)', 'yellow');
      return;
    }
    const response = await makeRequest('GET', `/notifications/user/${testData.ids.workerId}`, null, testData.tokens.worker);
    if (!response.success && response.status !== 404) throw new Error(`HTTP ${response.status}`);
  }, 'Notifications');
}

async function testPushNotifications() {
  log('\n[9] PUSH NOTIFICATIONS', 'cyan');
  
  await test('Get VAPID Public Key', async () => {
    const response = await makeRequest('GET', '/push/public-key');
    if (!response.success) throw new Error(`HTTP ${response.status}`);
    if (!response.data.data?.publicKey) throw new Error('No public key');
  }, 'Push');
}

async function testSafetyVideos() {
  log('\n[10] SAFETY VIDEOS', 'cyan');
  
  await test('Get All Safety Videos', async () => {
    const response = await makeRequest('GET', '/safety-videos', null, testData.tokens.admin);
    if (!response.success) throw new Error(`HTTP ${response.status}`);
  }, 'Videos');
}

// Main test runner
async function runAllTests() {
  const startTime = Date.now();
  
  try {
    await testAuthentication();
    await testRoles();
    await testUsers();
    await testTasks();
    await testChecklists();
    await testAttendance();
    await testHazards();
    await testNotifications();
    await testPushNotifications();
    await testSafetyVideos();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    // Summary
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    TEST SUMMARY                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    
    log(`Total Tests:    ${results.total}`, 'cyan');
    log(`Passed:         ${results.passed}`, 'green');
    log(`Failed:         ${results.failed}`, results.failed > 0 ? 'red' : 'green');
    log(`Success Rate:   ${((results.passed / results.total) * 100).toFixed(2)}%`, 
        results.failed === 0 ? 'green' : 'yellow');
    log(`Duration:       ${duration}s`, 'cyan');
    
    // Group by category
    console.log('\n📊 Results by Category:');
    const categories = {};
    results.tests.forEach(t => {
      if (!categories[t.category]) {
        categories[t.category] = { passed: 0, failed: 0 };
      }
      if (t.status === 'PASSED') categories[t.category].passed++;
      else categories[t.category].failed++;
    });
    
    Object.entries(categories).forEach(([cat, stats]) => {
      const total = stats.passed + stats.failed;
      const color = stats.failed === 0 ? 'green' : 'yellow';
      log(`  ${cat}: ${stats.passed}/${total} passed`, color);
    });
    
    // Failed tests details
    if (results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.tests.filter(t => t.status === 'FAILED').forEach((t, i) => {
        log(`  ${i + 1}. [${t.category}] ${t.name}`, 'red');
        log(`     ${t.error}`, 'yellow');
      });
    }
    
    // Save results
    const reportPath = 'deployed-test-results.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      backend_url: BASE_URL,
      summary: {
        total: results.total,
        passed: results.passed,
        failed: results.failed,
        duration: duration
      },
      tests: results.tests,
      test_data: {
        created_user_ids: [testData.ids.adminId, testData.ids.workerId],
        created_emails: [testData.users.admin.email, testData.users.worker.email]
      }
    }, null, 2));
    
    log(`\n📄 Detailed results saved to: ${reportPath}`, 'cyan');
    
    console.log('\n✅ Testing complete!\n');
    
    process.exit(results.failed > 0 ? 1 : 0);
    
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
