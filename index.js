const puppeteer = require('puppeteer-firefox');

async function scrollToBottom(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function extractVideoData(page) {
    const videos = await page.evaluate(() => {
        const videoElements = document.querySelectorAll('div[data-e2e="user-post-item"]');
        return Array.from(videoElements).map(video => {
            const link = video.querySelector('a')?.href;
            const description = video.querySelector('div[class*="description"]')?.textContent || '';
            const hashtags = description.match(/#\w+/g) || [];
            return {
                link,
                description,
                hashtags
            };
        });
    });
    return videos;
}

async function crawlTikTokHashtags(profileUrl) {
    // Launch Firefox browser
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        product: 'firefox',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--window-size=1920x1080',
        ]
    });

    try {
        const page = await browser.newPage();
        
        // Set a realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0');
        
        // Set longer timeouts
        page.setDefaultNavigationTimeout(120000);
        page.setDefaultTimeout(120000);

        // Enable request interception
        await page.setRequestInterception(true);
        page.on('request', request => {
            request.continue();
        });

        // Navigate to the TikTok profile
        console.log(`Navigating to ${profileUrl}...`);
        await page.goto(profileUrl, { 
            waitUntil: 'networkidle0',
            timeout: 120000
        });

        // Wait for initial content to load
        await page.waitForSelector('div[data-e2e="user-post-item"]', { timeout: 30000 });

        // Scroll to load more videos
        console.log('Scrolling to load more videos...');
        await scrollToBottom(page);
        
        // Wait a bit for new content to load
        await page.waitForTimeout(2000);

        // Extract data from videos
        const videos = await extractVideoData(page);
        
        // Filter to get only the first 5 videos
        const firstFiveVideos = videos.slice(0, 5);

        console.log('Found videos:', firstFiveVideos.length);
        firstFiveVideos.forEach((video, index) => {
            console.log(`\nVideo ${index + 1}:`);
            console.log('Link:', video.link);
            console.log('Hashtags:', video.hashtags);
        });

        // Save the results to a file
        const fs = require('fs');
        fs.writeFileSync('tiktok_hashtags.json', JSON.stringify({
            profileUrl,
            videos: firstFiveVideos,
            timestamp: new Date().toISOString()
        }, null, 2));

        console.log('\nResults saved to tiktok_hashtags.json');

    } catch (error) {
        console.error('Error during crawling:', error);
        // Take a screenshot for debugging
        await page.screenshot({ path: 'error-screenshot.png' });
        console.log('Error screenshot saved to error-screenshot.png');
    } finally {
        await browser.close();
    }
}

// Example usage with a TikTok profile URL
const tiktokProfileUrl = 'https://www.tiktok.com';
crawlTikTokHashtags(tiktokProfileUrl); 