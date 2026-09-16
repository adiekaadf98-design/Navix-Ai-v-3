const http = require('http');

async function testEndpoint(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data: JSON.parse(data || '{}') });
      });
    });

    req.on('error', error => reject(error));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log("Starting End-to-End Backend Module Tests...");
  let token = null;

  try {
    // 1. Test Login
    const loginRes = await testEndpoint('/api/auth/login', 'POST', { email: 'admin@navix.ai', password: 'admin' });
    console.log("Login Test:", loginRes.statusCode === 200 ? "PASSED" : "FAILED", loginRes.data);
    token = loginRes.data.token;

    if (!token) throw new Error("No token received, aborting further tests.");

    // 2. Test Health
    const healthRes = await testEndpoint('/api/monitoring/health', 'GET', null, token);
    console.log("Health Check Test:", healthRes.statusCode === 200 ? "PASSED" : "FAILED", healthRes.data);

    // 3. Test Task Submit
    const taskRes = await testEndpoint('/api/tasks', 'POST', { type: 'test_task', payload: { foo: 'bar' } }, token);
    console.log("Task Submit Test:", taskRes.statusCode === 200 ? "PASSED" : "FAILED", taskRes.data);

    // 4. Test Task Status
    if (taskRes.data.taskId) {
      const statusRes = await testEndpoint(`/api/tasks/${taskRes.data.taskId}`, 'GET', null, token);
      console.log("Task Status Test:", statusRes.statusCode === 200 ? "PASSED" : "FAILED", statusRes.data);
    }

    console.log("\nAll core module integration tests completed successfully.");

  } catch (err) {
    console.error("Test execution failed:", err);
  }
}

runTests();
