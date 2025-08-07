#!/usr/bin/env node

const axios = require('axios');

// Test data
const testUser = {
  username: 'testuser123',
  email: 'test@example.com',
  password: 'testpass123',
  displayName: 'Test User',
  confirmPassword: 'testpass123',
  acceptTerms: true
};

async function testRegistration() {
  console.log('🧪 Testing QuestForge registration...');
  
  try {
    // Make registration request
    const response = await axios.post('http://localhost:5000/api/auth/register', testUser, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Registration failed!');
    
    if (error.response) {
      // Server responded with error status
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received. Is the server running?');
      console.error('Request:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testRegistration();
