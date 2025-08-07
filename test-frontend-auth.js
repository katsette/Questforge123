const axios = require('axios');

// Frontend auth service simulation
const API_BASE_URL = 'http://localhost:5000/api';

const testFrontendAuth = async () => {
  console.log('🧪 Testing Frontend Authentication Flow...\n');

  try {
    // 1. Test health check
    console.log('1️⃣ Testing backend connection...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Backend health:', healthResponse.data);
    console.log('');

    // 2. Test login with valid credentials
    console.log('2️⃣ Testing login with valid credentials...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      login: 'alice',
      password: 'password123'
    });
    
    console.log('✅ Login successful!');
    console.log('📋 Login Response:');
    console.log('  - Message:', loginResponse.data.message);
    console.log('  - Token:', loginResponse.data.token ? '✅ Present' : '❌ Missing');
    console.log('  - User ID:', loginResponse.data.user.id);
    console.log('  - Username:', loginResponse.data.user.username);
    console.log('  - Email:', loginResponse.data.user.email);
    console.log('  - Name:', `${loginResponse.data.user.firstName} ${loginResponse.data.user.lastName}`);
    console.log('');

    const token = loginResponse.data.token;

    // 3. Test token verification
    console.log('3️⃣ Testing token verification...');
    const verifyResponse = await axios.get(`${API_BASE_URL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Token verification successful!');
    console.log('📋 Verification Response:', verifyResponse.data);
    console.log('');

    // 4. Test getting current user
    console.log('4️⃣ Testing get current user...');
    const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Get user successful!');
    console.log('📋 User Data:');
    console.log('  - Username:', userResponse.data.user.username);
    console.log('  - Email:', userResponse.data.user.email);
    console.log('  - Campaigns:', userResponse.data.user.campaigns.length);
    console.log('  - Characters:', userResponse.data.user.characters.length);
    console.log('');

    // 5. Test logout
    console.log('5️⃣ Testing logout...');
    const logoutResponse = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Logout successful!');
    console.log('📋 Logout Response:', logoutResponse.data);
    console.log('');

    // 6. Test invalid credentials
    console.log('6️⃣ Testing invalid credentials...');
    try {
      await axios.post(`${API_BASE_URL}/auth/login`, {
        login: 'nonexistent',
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed!');
    } catch (error) {
      console.log('✅ Invalid credentials properly rejected!');
      console.log('📋 Error Response:', error.response.data);
    }
    console.log('');

    console.log('🎉 All frontend authentication tests passed!\n');
    console.log('📋 Available test users:');
    console.log('  - Username: alice, Email: alice@example.com, Password: password123');
    console.log('  - Username: testdm, Email: dm@example.com, Password: password123');
    console.log('  - Username: testuser123, Email: test@example.com, Password: password123');
    console.log('');
    console.log('🌐 Frontend URL: http://localhost:3000');
    console.log('🔗 Login Page: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('Full error:', error);
  }
};

// Run the test
testFrontendAuth();
