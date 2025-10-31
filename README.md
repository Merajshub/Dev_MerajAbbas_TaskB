# Web Scraper API

A lightweight, headless browser web scraper API built with Node.js/Express and Puppeteer. Extracts page metadata (title, meta description, h1) from any URL with built-in timeout handling and retry logic.

## Setup Instructions

### Prerequisites
- Node.js 16+ installed
- npm or yarn

## Dependencies

- **express** - Web framework
- **puppeteer** - Headless browser automation

### Installation

1. Clone the repository: git clone https://github.com/Merajshub/Dev_MerajAbbas_TaskB
2. npm install
3. npm start

## Endpoint Details

### GET /api/scrape

Extracts basic page information from a given URL.
**Request:**
GET /api/scrape?url=https://example.com

**Success Response (200):**
{
"title": "Example Domain",
"metaDescription": "Example domain description",
"h1": "Example Domain",
"status": 200
}


**Error Responses:**

Invalid URL (400):
{
"error": "Invalid URL"
}


Timeout (504):
{
"error": "Timeout"
}


Server Error (500):
{
"error": "Failed to scrape page"
}

## Assumptions

- **20-Second Timeout**: All requests timeout after 20 seconds
- **Network Idle**: Waits for `networkidle2` (no more than 2 active network connections for 500ms)
- **Headless Mode**: Browser runs without a GUI
- **User-Agent Rotation**: Randomly rotates between realistic Chrome user agents to avoid detection
- **Automatic Retry**: Retries once if navigation fails due to a timeout
- **Basic Extraction**: Only extracts title, meta description, and first h1 element
- **HTTP Status**: Returns the HTTP status code from the target website


