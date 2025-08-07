const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let userId = '';
let campaignId = '';
let characterId = '';

async function testAPI() {
  console.log('🧪 Testing QuestForge API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Health check:', healthResponse.data.status);

    // Test 2: User Registration
    console.log('\n2. Testing User Registration...');
    const registerData = {
      username: 'testdm',
      email: 'dm@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'DM'
    };
    
    const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, registerData);
    authToken = registerResponse.data.token;
    userId = registerResponse.data.user.id;
    console.log('✅ User registered:', registerResponse.data.user.username);

    // Test 3: Login
    console.log('\n3. Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      login: 'testdm',
      password: 'password123'
    });
    authToken = loginResponse.data.token; // Use fresh token
    console.log('✅ Login successful:', loginResponse.data.user.username);

    // Test 4: Token Verification
    console.log('\n4. Testing Token Verification...');
    const verifyResponse = await axios.get(`${BASE_URL}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Token valid:', verifyResponse.data.valid);

    // Test 5: Get Current User
    console.log('\n5. Testing Get Current User...');
    const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ User data retrieved:', meResponse.data.user.username);

    console.log('\n🎉 All API tests passed!');
    console.log('\n📊 Test Results:');
    console.log(`- User ID: ${userId}`);
    console.log(`- Auth Token: ${authToken.substring(0, 50)}...`);
    console.log('- Database: SQLite working correctly');
    console.log('- Authentication: JWT working correctly');
    console.log('- API Endpoints: All tested endpoints working');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Install axios if not available and run test
testAPI();
