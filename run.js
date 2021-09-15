const pj_tracer = require('./index.js');
const puppeteer = require('puppeteer-extra')
const fs = require('fs');
const util = require('util');
const launchOptions = {
    //headless: (process.env.CRAWL_HEADLESS || false),
    headless: false,
    ignoreHTTPSErrors: true,
    userDataDir: './tmp',
    args: [
        '--disable-sync',
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
    ]
};

// those options need to be provided on startup
// and cannot give to pj-tracer on tracer() calls
let browser_config = {
    //user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36', //Desktop
    user_agent: 'Mozilla/5.0 (Linux; Android 7.0; SM-G930V Build/NRD90M) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.125 Mobile Safari/537.36', //Chrome Mobile
    //Device Type information to provide Screensize and other respective behaviour for that device to the browser
    //Desktop | Mobile | Tablet
    device: 'Desktop',
    //Proxy Information for browser to be used for page crawling
    proxy_data: [],
};



(async () => {
    // scrape config can change on each scrape() call
    let trace_config = {
        //search_engine: 'google',
        // an array of keywords to scrape
        urls: ['https://www.google.com/aclk?sa=L&ai=DChcSEwiUttOb4f3yAhWVC5EKHU9kBssYABAAGgJjZQ&ei=wDZAYcrAHrrV1sQPkIqI4AY&sig=AOD64_3fp2ZbAbB9uuvnSLpPiMhsztm9wA&q&sqi=2&adurl&ved=2ahUKEwjKoMub4f3yAhW6qpUCHRAFAmwQ0Qx6BAgCEAE'],
        
        ignored_domains: [],
    };
    const browser = await puppeteer.launch(launchOptions);
    let results = await pj_tracer.trace(browser, browser_config, trace_config);
    console.dir(results, {depth: null, colors: true});
})();

