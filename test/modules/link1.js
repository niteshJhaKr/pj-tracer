'use strict';

const pj_tracer =  require('../../index.js');
const puppeteer = require('puppeteer');

const fs = require('fs');
const util = require('util');
const assert = require('assert');
const path = require('path');
const debug = require('debug')('pj-tracer:test');
const tracer  = require('../../src/modules/tracer_module.js');
const { exit } = require('process');

describe('Link Tracer', function(){
    let browser;
    let page;
    beforeEach(async function(){
        this.timeout(0);
        debug('Start a new browser');
        browser = await puppeteer.launch({
            headless: false,
            ignoreHTTPSErrors: true,
            //userDataDir: './tmp',
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
            //dumpio: true,
            //headless: false,
        });
        debug('Open a fresh page');
        page = await browser.newPage();
    });

    afterEach(async function(){
        await browser.close();
    });

    // const testLogger = createLogger({
    //     transports: [
    //         new transports.Console({
    //             level: 'error'
    //         })
    //     ]
    // });

    it('one keyword one page', function(){
        this.timeout(0);
        const linkTracer = new tracer.Tracer({
            config: {
                // the user agent to trace with
                user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3835.0 Safari/537.36',
                //Which Device Type to use
                device: 'Desktop',
                device_specs: {
                    width: 1920,
                    height: 1080,
                },
                logger: '',  
                ignored_plain_urls:[],
                ignored_wildcard_domains:[],           
                urls: ['https://www.google.com/aclk?sa=L&ai=DChcSEwiUttOb4f3yAhWVC5EKHU9kBssYABAAGgJjZQ&ei=wDZAYcrAHrrV1sQPkIqI4AY&sig=AOD64_3fp2ZbAbB9uuvnSLpPiMhsztm9wA&q&sqi=2&adurl&ved=2ahUKEwjKoMub4f3yAhW6qpUCHRAFAmwQ0Qx6BAgCEAE'],
                ignored_domains: '',
     
            }
        });

        linkTracer.STANDARD_TIMEOUT = 500;
        return linkTracer.run({page}).then(({results,metadata, num_requests}) => {
        assert(results[0][0]['URL'] != '',"At least one URL is required"); 
        assert(results[0][0]['status'] != '',"At least one status is required"); 
        assert(results[0][0]['request_redirect_type'] != '',"At least one request_redirect_type is required");  
        });
    });

});