// Test script to verify API usage tracking
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';
const API_KEY = 'sk_7c1c6************************9330edd3'; // Replace with your actual API key

async function testApiUsage() {
  console.log('🧪 Testing API Usage Tracking...\n');

  try {
    // Test 1: Generate a few QR codes
    console.log('📊 Generating QR codes to test usage tracking...');
    
    for (let i = 1; i <= 3; i++) {
      const response = await axios.get(`${API_BASE_URL}/qrcode`, {
        params: {
          url: `https://example${i}.com`,
          name: `Test QR ${i}`
        },
        headers: {
          'x-api-key': API_KEY
        }
      });
      
      console.log(`✅ QR ${i} generated:`, response.data.qrCode.id);
      console.log(`📈 Usage after QR ${i}:`, response.data.usage);
      console.log('---');
    }

    // Test 2: Generate with customization
    console.log('\n🎨 Testing advanced QR generation...');
    
    const advancedResponse = await axios.post(`${API_BASE_URL}/qrcode/generate`, {
      url: 'https://advanced-test.com',
      name: 'Advanced Test QR',
      customization: {
        size: 300,
        foregroundColor: '#FF0000',
        backgroundColor: '#FFFFFF',
        errorCorrectionLevel: 'H',
        margin: 6
      }
    }, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Advanced QR generated:', advancedResponse.data.qrCode.id);
    console.log('📈 Final usage stats:', advancedResponse.data.usage);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testApiUsage();