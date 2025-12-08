// Test Authentication Middleware
// Run this after starting the server to verify auth works

import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api/v1';

async function testAuthentication() {
    console.log('🧪 Testing Authentication Middleware\n');

    // Test 1: No Authorization Header
    console.log('Test 1: POST /safety-videos/upload WITHOUT Authorization header');
    try {
        const response = await axios.post(`${BASE_URL}/safety-videos/upload`, {
            title: 'Test Video'
        });
        console.log('❌ FAILED: Request succeeded without auth!');
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ PASSED: Got 401 Unauthorized');
            console.log('Message:', error.response.data.message);
        } else {
            console.log('❌ FAILED: Got unexpected error');
            console.log('Status:', error.response?.status);
            console.log('Data:', error.response?.data);
        }
    }

    console.log('\n---\n');

    // Test 2: Invalid Token
    console.log('Test 2: POST /safety-videos/upload WITH invalid token');
    try {
        const response = await axios.post(`${BASE_URL}/safety-videos/upload`, {
            title: 'Test Video'
        }, {
            headers: {
                'Authorization': 'Bearer invalid_token_here'
            }
        });
        console.log('❌ FAILED: Request succeeded with invalid token!');
        console.log('Response:', response.data);
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ PASSED: Got 401 Unauthorized');
            console.log('Message:', error.response.data.message);
        } else {
            console.log('❌ FAILED: Got unexpected error');
            console.log('Status:', error.response?.status);
            console.log('Data:', error.response?.data);
        }
    }
}

testAuthentication();
