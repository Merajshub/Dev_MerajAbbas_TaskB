const axios = require('axios');

const testUrls = [
  'https://example.com',
  'https://github.com',
  'invalid-url',
  'https://httpbin.org/delay/25'
];

async function test() {
  for (const url of testUrls) {
    try {
      console.log(`\nTesting: ${url}`);
      const response = await axios.get(`http://localhost:3000/api/scrape?url=${encodeURIComponent(url)}`);
      console.log('Success:', response.data);
    } catch (error) {
      console.log('Error:', error.response?.status, error.response?.data);
    }
  }
}

test();
