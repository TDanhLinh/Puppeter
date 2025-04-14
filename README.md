# Puppeteer Web Crawler

A simple web crawler built with Puppeteer.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run the crawler:
```bash
npm start
```

## Features

- Crawls websites using Puppeteer
- Extracts page title and links
- Configurable browser settings
- Error handling

## Customization

You can modify the `index.js` file to:
- Change the target URL
- Add more data extraction
- Modify browser settings
- Add additional crawling logic

## Notes

- The browser runs in non-headless mode by default (visible browser window)
- To run in headless mode, change `headless: false` to `headless: true` in `index.js` 