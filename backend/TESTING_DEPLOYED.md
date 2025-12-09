# Testing Your Deployed Backend on Render

## Quick Start

### Step 1: Edit the test file with your Render URL

Open `test-deployed.js` and replace this line:

```javascript
const BASE_URL = process.env.RENDER_URL || 'https://your-app-name.onrender.com/api/v1';
```

Replace `https://your-app-name.onrender.com/api/v1` with your actual Render backend URL.

**OR** set it as an environment variable:

```powershell
$env:RENDER_URL="https://your-actual-backend.onrender.com/api/v1"
```

### Step 2: Run the tests

```powershell
cd C:\Users\janar\Desktop\Suraksha-Sathi\backend
node test-deployed.js
```

## What Gets Tested

✅ **Authentication** (4 tests)
- Register new users
- Login
- Get current user
- Refresh token

✅ **Roles** (2 tests)
- Get all roles
- Create new role

✅ **Users** (4 tests)
- Get all users
- Get user by ID
- Create worker
- Login worker

✅ **Tasks** (3 tests)
- Create task
- Get all tasks
- Update task

✅ **Checklists** (2 tests)
- Create checklist
- Get all checklists

✅ **Attendance** (2 tests)
- Worker check-in
- Get today's attendance

✅ **Hazards** (4 tests)
- Create category
- Create severity tag
- Create hazard report
- Get all reports

✅ **Notifications** (2 tests)
- Create notification
- Get user notifications

✅ **Push Notifications** (1 test)
- Get VAPID public key

✅ **Safety Videos** (1 test)
- Get all videos

**Total: ~25 API tests covering core functionality**

## Expected Output

```
╔═══════════════════════════════════════════════════════════╗
║  TESTING DEPLOYED BACKEND ON RENDER                      ║
╚═══════════════════════════════════════════════════════════╝

Backend URL: https://your-app.onrender.com/api/v1

[1] AUTHENTICATION
  ✓ Register Admin
  ✓ Login Admin
  ✓ Get Current User
  ✓ Refresh Token

[2] ROLES
  ✓ Get All Roles
  ✓ Create New Role

...

╔═══════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                           ║
╚═══════════════════════════════════════════════════════════╝

Total Tests:    25
Passed:         25
Failed:         0
Success Rate:   100.00%
Duration:       15.3s

📊 Results by Category:
  Auth: 4/4 passed
  Roles: 2/2 passed
  Users: 4/4 passed
  Tasks: 3/3 passed
  Checklists: 2/2 passed
  Attendance: 2/2 passed
  Hazards: 4/4 passed
  Notifications: 2/2 passed
  Push: 1/1 passed
  Videos: 1/1 passed

📄 Detailed results saved to: deployed-test-results.json

✅ Testing complete!
```

## Test Results File

After running, check `deployed-test-results.json` for:
- Full test results
- Response times
- Created test user IDs (for cleanup)
- Error details if any tests failed

## Troubleshooting

### "Please set your Render backend URL!"
Edit `test-deployed.js` line 8 with your actual URL

### curl not found
Install curl for Windows or the script will use PowerShell's Invoke-WebRequest

### 401 Unauthorized errors
- Check if your MongoDB is connected on Render
- Verify JWT secrets are set in Render environment variables

### 500 Internal Server errors
- Check Render logs: `Dashboard → Your Service → Logs`
- Verify all environment variables are set (MongoDB URI, Cloudinary, etc.)

### Connection timeout
- Your Render backend might be sleeping (free tier)
- Wait 30-60 seconds and try again
- Check Render dashboard to see if service is running

## Cleanup

The test creates temporary users and data. To clean up:

1. Check `deployed-test-results.json` for created user IDs
2. Delete them manually from MongoDB or through admin panel
3. Test users have emails like: `test.admin.1733738400000@test.com`

## Running Specific Test Categories

To test only certain features, comment out test functions in `runAllTests()`:

```javascript
async function runAllTests() {
  // await testAuthentication();
  // await testRoles();
  await testTasks();  // Only test tasks
  // await testChecklists();
  // ...
}
```

## What's Your Render URL?

You can find it in:
1. Render Dashboard → Your Service → URL (e.g., `https://suraksha-sathi-xyz.onrender.com`)
2. Add `/api/v1` to the end
3. Final URL: `https://suraksha-sathi-xyz.onrender.com/api/v1`

Example:
```javascript
const BASE_URL = 'https://suraksha-sathi-api.onrender.com/api/v1';
```
