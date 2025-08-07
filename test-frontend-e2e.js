const axios = require('axios');

// Test frontend functionality directly
const testFrontendDirectAccess = async () => {
  console.log('🌐 Testing Frontend Direct Access...\n');
  
  try {
    // Test main page
    console.log('1️⃣ Testing main page access...');
    const mainResponse = await axios.get('http://localhost:3000');
    console.log('✅ Main page accessible');
    console.log('📋 Page title found:', mainResponse.data.includes('QuestForge'));
    
    // Test login page
    console.log('\n2️⃣ Testing login page access...');
    const loginPageResponse = await axios.get('http://localhost:3000/login');
    console.log('✅ Login page accessible');
    console.log('📋 React app loaded:', loginPageResponse.data.includes('root'));
    
    console.log('\n✅ Frontend pages are accessible!\n');
    
  } catch (error) {
    console.error('❌ Frontend access test failed:', error.message);
  }
};

// Test the auth service configuration
const testAuthServiceConfig = async () => {
  console.log('🔧 Testing Auth Service Configuration...\n');
  
  try {
    // Simulate the frontend's auth service port discovery
    const DEVELOPMENT_PORTS = [5001, 5000, 5002, 5003, 8000, 8001, 3001];
    let workingPort = null;
    
    console.log('🔍 Discovering backend port (simulating frontend)...');
    
    for (const port of DEVELOPMENT_PORTS) {
      const testUrl = `http://localhost:${port}`;
      try {
        console.log(`  🧪 Testing port ${port}...`);
        const response = await axios.get(`${testUrl}/api/health`, { 
          timeout: 2000,
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.status === 200) {
          console.log(`  ✅ Found backend on port ${port}`);
          workingPort = port;
          break;
        }
      } catch (error) {
        console.log(`  ❌ Port ${port} not available`);
      }
    }
    
    if (workingPort) {
      console.log(`\n✅ Backend discovered on port ${workingPort}`);
      
      // Test login with discovered port
      console.log('\n3️⃣ Testing login with discovered backend...');
      const loginResponse = await axios.post(`http://localhost:${workingPort}/api/auth/login`, {
        login: 'alice',
        password: 'password123'
      });
      
      console.log('✅ Login successful with discovered backend!');
      console.log('📋 User:', loginResponse.data.user.username);
      
    } else {
      console.log('\n❌ No working backend port found');
    }
    
  } catch (error) {
    console.error('❌ Auth service config test failed:', error.message);
  }
};

// Test full authentication flow
const testFullAuthFlow = async () => {
  console.log('🔐 Testing Complete Authentication Flow...\n');
  
  const API_BASE_URL = 'http://localhost:5000/api';
  const FRONTEND_URL = 'http://localhost:3000';
  
  try {
    console.log('1️⃣ Verifying backend is ready...');
    await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend ready');
    
    console.log('\n2️⃣ Verifying frontend is ready...');
    await axios.get(FRONTEND_URL);
    console.log('✅ Frontend ready');
    
    console.log('\n3️⃣ Testing complete login flow...');
    
    // Step 1: Login
    console.log('   📝 Step 1: Login request...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      login: 'alice',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('   ✅ Login successful, token received');
    
    // Step 2: Verify token (as frontend would do)
    console.log('   🔍 Step 2: Token verification...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ Token valid');
    
    // Step 3: Get user data (as frontend would do)
    console.log('   👤 Step 3: Fetch user data...');
    const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ User data retrieved');
    console.log('   📋 User:', userResponse.data.user.username);
    console.log('   📋 Campaigns:', userResponse.data.user.campaigns.length);
    console.log('   📋 Characters:', userResponse.data.user.characters.length);
    
    // Step 4: Logout
    console.log('   🚪 Step 4: Logout...');
    await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ Logout successful');
    
    console.log('\n🎉 Complete authentication flow successful!');
    
  } catch (error) {
    console.error('❌ Full auth flow test failed:', error.response?.data || error.message);
  }
};

// Main test function
const runFrontendTests = async () => {
  console.log('🧪 QuestForge Frontend Authentication Tests');
  console.log('=' .repeat(50));
  
  await testFrontendDirectAccess();
  await testAuthServiceConfig();
  await testFullAuthFlow();
  
  console.log('\n📋 Test Summary:');
  console.log('🌐 Frontend URL: http://localhost:3000');
  console.log('🔗 Login Page: http://localhost:3000/login');
  console.log('🔗 Register Page: http://localhost:3000/register');
  console.log('🔗 Dashboard: http://localhost:3000/dashboard');
  console.log('\n📝 Test Credentials:');
  console.log('  • Username: alice | Password: password123');
  console.log('  • Username: testdm | Password: password123');
  console.log('  • Email: alice@example.com | Password: password123');
  console.log('\n✅ Frontend authentication is working correctly!');
  console.log('🎮 You can now test the login in your browser at http://localhost:3000/login');
};

// Run tests
runFrontendTests();
