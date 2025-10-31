const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// Common user agents for rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
];

// Validate URL helper
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

// Main scraping function with retry logic
async function scrapeWithRetry(url, retries = 1) {
  let browser;
  let attempt = 0;
  
  while (attempt <= retries) {
    try {
      // Launch browser
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu'
        ]
      });

      const page = await browser.newPage();
      
      // Set random user agent
      const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      await page.setUserAgent(userAgent);
      
      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Set default navigation timeout to 20 seconds
      page.setDefaultNavigationTimeout(20000);
      
      // Navigate to the page
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 20000
      });
      
      // Extract page information
      const pageData = await page.evaluate(() => {
        // Extract title
        const title = document.querySelector('title')?.innerText || '';
        
        // Extract meta description
        const metaDescription = 
          document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        
        // Extract first h1
        const h1 = document.querySelector('h1')?.innerText || '';
        
        return { title, metaDescription, h1 };
      });
      
      const statusCode = response.status();
      
      await browser.close();
      
      return {
        title: pageData.title,
        metaDescription: pageData.metaDescription,
        h1: pageData.h1,
        status: statusCode
      };
      
    } catch (error) {
      attempt++;
      
      if (browser) {
        await browser.close();
      }
      
      // If timeout error and we have retries left
      if (error.name === 'TimeoutError' && attempt <= retries) {
        console.log(`Timeout on attempt ${attempt}, retrying...`);
        continue;
      }
      
      // Re-throw error if no retries left
      throw error;
    }
  }
}

// API endpoint
app.get('/api/scrape', async (req, res) => {
  const { url } = req.query;
  
  // Validate URL parameter
  if (!url) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  
  if (!isValidUrl(url)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  
  try {
    // Scrape with one retry on navigation errors
    const result = await scrapeWithRetry(url, 1);
    return res.json(result);
    
  } catch (error) {
    console.error('Scraping error:', error.message);
    
    // Handle timeout errors
    if (error.name === 'TimeoutError') {
      return res.status(504).json({ error: 'Timeout' });
    }
    
    // Handle other errors
    return res.status(500).json({ 
      error: 'Failed to scrape page',
      details: error.message 
    });
  }
});

app.get('/test', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Scraper API running on port ${PORT}`);
});
