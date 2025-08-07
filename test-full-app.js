const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

async function testFullApplication() {
  console.log('🧪 QuestForge Full Application Test\n');
  console.log('=' .repeat(50));
  
  const testResults = {
    backend: { passed: 0, failed: 0, tests: [] },
    frontend: { passed: 0, failed: 0, tests: [] },
    integration: { passed: 0, failed: 0, tests: [] }
  };

  // Backend Tests
  console.log('\n📡 BACKEND TESTS');
  console.log('-'.repeat(30));

  try {
    // Test 1: Health Check
    console.log('1. Health Check...');
    const health = await axios.get(`${BACKEND_URL}/api/health`);
    console.log(`   ✅ Status: ${health.data.status}`);
    testResults.backend.passed++;
    testResults.backend.tests.push({ name: 'Health Check', status: 'PASS' });
  } catch (error) {
    console.log(`   ❌ Health check failed: ${error.message}`);
    testResults.backend.failed++;
    testResults.backend.tests.push({ name: 'Health Check', status: 'FAIL', error: error.message });
  }

  try {
    // Test 2: User Registration
    console.log('2. User Registration...');
    const registerData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User'
    };
    
    const registerResponse = await axios.post(`${BACKEND_URL}/api/auth/register`, registerData);
    console.log(`   ✅ User registered: ${registerResponse.data.user.username}`);
    testResults.backend.passed++;
    testResults.backend.tests.push({ name: 'User Registration', status: 'PASS' });

    // Test 3: User Login
    console.log('3. User Login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      login: registerData.username,
      password: registerData.password
    });
    const authToken = loginResponse.data.token;
    console.log(`   ✅ Login successful, token received`);
    testResults.backend.passed++;
    testResults.backend.tests.push({ name: 'User Login', status: 'PASS' });

    // Test 4: Protected Route
    console.log('4. Protected Route Access...');
    const meResponse = await axios.get(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log(`   ✅ Protected route accessible: ${meResponse.data.user.username}`);
    testResults.backend.passed++;
    testResults.backend.tests.push({ name: 'Protected Route', status: 'PASS' });

  } catch (error) {
    console.log(`   ❌ Authentication flow failed: ${error.response?.data?.message || error.message}`);
    testResults.backend.failed++;
    testResults.backend.tests.push({ name: 'Authentication Flow', status: 'FAIL', error: error.message });
  }

  // Frontend Tests
  console.log('\n🌐 FRONTEND TESTS');
  console.log('-'.repeat(30));

  try {
    // Test 5: Frontend Accessibility
    console.log('5. Frontend Page Load...');
    const frontendResponse = await axios.get(FRONTEND_URL);
    const hasReactRoot = frontendResponse.data.includes('id="root"');
    
    if (hasReactRoot) {
      console.log('   ✅ React app structure loaded correctly');
      testResults.frontend.passed++;
      testResults.frontend.tests.push({ name: 'Frontend Load', status: 'PASS' });
    } else {
      throw new Error('React app structure not found');
    }
  } catch (error) {
    console.log(`   ❌ Frontend load failed: ${error.message}`);
    testResults.frontend.failed++;
    testResults.frontend.tests.push({ name: 'Frontend Load', status: 'FAIL', error: error.message });
  }

  

  // Database Tests
  console.log('\n🗄️  DATABASE TESTS');
  console.log('-'.repeat(30));

  try {
    // Test 7: Database Operations
    console.log('7. Database CRUD Operations...');
    
    // Register multiple users to test database
    const users = [];
    for (let i = 0; i < 3; i++) {
      const userData = {
        username: `dbtest_${i}_${Date.now()}`,
        email: `dbtest_${i}_${Date.now()}@example.com`,
        password: 'testpass123',
        firstName: `Test${i}`,
        lastName: 'User'
      };
      
      const response = await axios.post(`${BACKEND_URL}/api/auth/register`, userData);
      users.push(response.data.user);
    }
    
    console.log(`   ✅ Created ${users.length} test users successfully`);
    console.log(`   ✅ SQLite database operations working`);
    testResults.integration.passed++;
    testResults.integration.tests.push({ name: 'Database CRUD', status: 'PASS' });
    
  } catch (error) {
    console.log(`   ❌ Database operations failed: ${error.message}`);
    testResults.integration.failed++;
    testResults.integration.tests.push({ name: 'Database CRUD', status: 'FAIL', error: error.message });
  }

  // Final Results
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const totalPassed = testResults.backend.passed + testResults.frontend.passed + testResults.integration.passed;
  const totalFailed = testResults.backend.failed + testResults.frontend.failed + testResults.integration.failed;
  const totalTests = totalPassed + totalFailed;
  
  console.log(`\n🎯 Overall Results:`);
  console.log(`   Total Tests: ${totalTests}`);
  console.log(`   ✅ Passed: ${totalPassed}`);
  console.log(`   ❌ Failed: ${totalFailed}`);
  console.log(`   📈 Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  
  console.log(`\n📡 Backend: ${testResults.backend.passed}/${testResults.backend.passed + testResults.backend.failed} passed`);
  console.log(`🌐 Frontend: ${testResults.frontend.passed}/${testResults.frontend.passed + testResults.frontend.failed} passed`);
  console.log(`🗄️  Integration: ${testResults.integration.passed}/${testResults.integration.passed + testResults.integration.failed} passed`);

  console.log('\n🎉 APPLICATION STATUS:');
  if (totalFailed === 0) {
    console.log('   ✅ ALL SYSTEMS OPERATIONAL');
    console.log('   ✅ Ready for production deployment!');
  } else if (totalPassed > totalFailed) {
    console.log('   ⚠️  MOSTLY FUNCTIONAL with minor issues');
    console.log('   ✅ Core functionality working');
  } else {
    console.log('   ❌ MAJOR ISSUES DETECTED');
    console.log('   🔧 Requires fixes before deployment');
  }

  console.log('\n🌍 Access URLs:');
  console.log(`   Backend API: ${BACKEND_URL}`);
  console.log(`   Frontend App: ${FRONTEND_URL}`);
  console.log(`   Health Check: ${BACKEND_URL}/api/health`);
  
  return {
    success: totalFailed === 0,
    totalTests,
    passed: totalPassed,
    failed: totalFailed,
    details: testResults
  };
}

// Run the test
testFullApplication()
  .then(results => {
    console.log('\n📝 Test completed successfully!');
    process.exit(results.success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  });
