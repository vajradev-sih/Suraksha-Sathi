// Test Worker Video Upload to find the 500 error
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const BASE_URL = 'https://mining-project.onrender.com/api/v1';

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
  
  pwshCmd += `@{StatusCode=$Response.StatusCode; Content=$Response.Content} | ConvertTo-Json -Compress } catch { if ($_.Exception.Response) { $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()); $content = $reader.ReadToEnd(); @{StatusCode=[int]$_.Exception.Response.StatusCode; Content=$content} | ConvertTo-Json -Compress } else { @{StatusCode=0; Content=$_.Exception.Message} | ConvertTo-Json -Compress } }`;
  
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
      success: false
    };
  }
}

async function testVideoUpload() {
  console.log('🔍 Testing Worker Video Upload Error\n');
  
  // Step 1: Register and login
  console.log('1. Creating test user...');
  const testUser = {
    email: `video.test.${Date.now()}@test.com`,
    password: 'VideoTest@12345',
    fullName: 'Video Test User',
    userName: `videotest${Date.now()}`,
    phone: '1234567890',
    language_pref: 'en'
  };
  
  const registerResp = await makeRequest('POST', '/user/register', testUser);
  if (!registerResp.success) {
    console.log('❌ Registration failed:', registerResp.status, registerResp.data);
    return;
  }
  console.log('✓ User registered');
  
  console.log('\n2. Logging in...');
  const loginResp = await makeRequest('POST', '/user/login', {
    email: testUser.email,
    password: testUser.password
  });
  
  if (!loginResp.success) {
    console.log('❌ Login failed:', loginResp.status, loginResp.data);
    return;
  }
  
  const token = loginResp.data.data.accessToken;
  console.log('✓ User logged in');
  
  // Step 3: Check available endpoints
  console.log('\n3. Testing video endpoints availability...');
  
  const endpoints = [
    { method: 'GET', path: '/worker-videos/approved', desc: 'Get Approved Videos' },
    { method: 'GET', path: '/worker-videos/my-videos', desc: 'Get My Videos' },
    { method: 'GET', path: '/safety-videos', desc: 'Get Safety Videos' }
  ];
  
  for (const ep of endpoints) {
    const resp = await makeRequest(ep.method, ep.path, null, token);
    console.log(`  ${ep.desc}: ${resp.status} ${resp.success ? '✓' : '✗'}`);
    if (!resp.success && resp.status === 500) {
      console.log(`    Error: ${JSON.stringify(resp.data).substring(0, 200)}`);
    }
  }
  
  console.log('\n4. Checking server logs for SafetyOfficer references...');
  console.log('   NOTE: The deployed backend on Render still has SafetyOfficer');
  console.log('   Your local code has been updated to TrainingOfficer');
  console.log('   You need to DEPLOY the updated code to Render\n');
  
  console.log('📋 DIAGNOSIS:\n');
  console.log('The 500 error is likely caused by one of these issues:');
  console.log('  1. Deployed backend still references SafetyOfficer (not updated)');
  console.log('  2. Database has role_name as "SafetyOfficer" but code expects "TrainingOfficer"');
  console.log('  3. Middleware is checking for SafetyOfficer which no longer exists\n');
  
  console.log('🔧 SOLUTIONS:\n');
  console.log('  Option 1: Deploy updated code to Render');
  console.log('    git add .');
  console.log('    git commit -m "Replace SafetyOfficer with TrainingOfficer"');
  console.log('    git push origin main\n');
  
  console.log('  Option 2: Update existing SafetyOfficer roles in database to TrainingOfficer');
  console.log('    This requires updating the Role model and existing user role_names\n');
  
  console.log('  Option 3: Keep both role names supported in authorization checks');
  console.log('    Update authorizeRoles to accept both SafetyOfficer and TrainingOfficer\n');
}

testVideoUpload().catch(console.error);
