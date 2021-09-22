'use strict';
const common = require('./common.js');
var log = common.log;
var isIgnoredDomain = common.isIgnoredDomain;

/*
    Get useful JS knowledge and get awesome...

    Read this shit: https://javascript.info/class-inheritance
    And this: https://medium.freecodecamp.org/here-are-examples-of-everything-new-in-ecmascript-2016-2017-and-2018-d52fa3b5a70e
 */

class Tracer {
    constructor(options = {}) {
        const {
            config = {},
            context = {},
            page = null,
        } = options;

        this.page = page;
        this.last_response = null; // the last response object
        this.metadata = {
            tracing_detected: false,
        };
        this.config = config;
        this.context = context;

        this.urls = config.urls;

        this.STANDARD_TIMEOUT = 5000;
        
        this.redirect_item = false;

        this.results = new Array();
        // keep track of the requests done
        this.num_requests = 0;
        // keep track of the URLs searched
        this.num_urls = 0;

        let settings = this.config[`${this.config.search_engine}_settings`];
        if (settings) {
            if (typeof settings === 'string') {
                settings = JSON.parse(settings);
                this.config[`${this.config.search_engine}_settings`] = settings;
            }
        }
    }

    async run({page, data}) {

        if (page) {
            this.page = page;
        }
        let urls = [];

        let PROXY_DATA = this.config.proxy_data;

        await this.page.setViewport({ width: this.config.device_specs.width, height: this.config.device_specs.width });
        await this.page.setUserAgent(this.config.user_agent);

        if( PROXY_DATA && PROXY_DATA.AUTHENTICATION && PROXY_DATA.AUTHENTICATION == 'BASIC_AUTH' ){
            await this.page.authenticate({
                username: PROXY_DATA.PROXY_USERNAME,
                password: PROXY_DATA.PROXY_PASSWORD
            });
        } else if( PROXY_DATA && PROXY_DATA.AUTHENTICATION && PROXY_DATA.AUTHENTICATION == 'BEARER_TOKEN'){
            await this.page.setExtraHTTPHeaders({
                'Proxy-Authorization': 'Basic ' + Buffer.from(PROXY_DATA.TOKEN+':').toString('base64'),
            });
        }


        await this.page.setRequestInterception(true);
        // added configuration
        await this.page.setCacheEnabled(false);

        // Configure the navigation timeout
        await this.page.setDefaultNavigationTimeout(0);

        this.page.on('request', (request) => {
            try{
                if (['image', 'stylesheet', 'font', 'media', 'xhr', 'websocket'].indexOf(request.resourceType()) !== -1) {
                    request.abort();
                } else {
                    request.continue();
                }
            } catch(error){
                log(this.config, 1, 'Interception Error in Tracer Module.js '+ error.toString())
            }
        });
        const client = await this.page.target().createCDPSession();
        await client.send('Network.enable');

        await client.on('Network.requestWillBeSent', (networkRequest) => {
            try{
                if (networkRequest.type !== "Document" || isIgnoredDomain(this.config, networkRequest.request.url) ) {
                    return;
                }
                
                // check if url redirected
                if (typeof networkRequest.redirectResponse != "undefined" ) {
                    this.redirect_item = {
                        "URL": networkRequest.request.url,
                        "status": networkRequest.redirectResponse.status,
                        "request_redirect_type": "server"
                    };
                } else {
                    try{
                        if (networkRequest.request.url !== urls[urls.length - 1] && !isIgnoredDomain(networkRequest.request.url) ) {
                            var redirectType = "Meta/Javascript";
                            if( networkRequest.request.url == url ){
                                redirectType = "Default";
                            }
                            this.redirect_item = {
                                "URL": networkRequest.request.url,
                                "status": 200,
                                "request_redirect_type": redirectType
                            }
                        }
                    } catch(error){
                        log(this.config, 1, 'Not Redirected Error in Tracer Module.js '+ error.toString())
                    }
                }
                if(this.redirect_item){
                    this.results[this.num_urls].push(this.redirect_item);
                }
            }catch (error) {
                log(this.config, 1, 'Assets/Redirect Block Error in Tracer Module.js '+ error.toString())
            }
        });
        await this.tracing_loop();
        return {
            results: this.results.filter(function (el) {
                return el != null;
              }),
            metadata: this.metadata,
            num_requests: this.num_requests,
        }
    }

    /**
     * Each scraper basically iterates over a list of
     * keywords and a list of pages. This is the generic
     * method for that.
     *
     * @returns {Promise<void>}
     */
    async tracing_loop() {
        for (var url of this.urls) {
            this.num_urls++;
            this.url = url;
            this.results[this.num_urls] = [];

            try {
                await this.page.goto(this.url)
                await this.wait_for_results();
            } catch (error) {
                log(this.config, 1, 'Page GOTO Error on Tracer Module.js '+ error.toString())
                console.error(`Problem with Tracing ${url} : ${error}`);
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms)
        })
    }

    async random_sleep() {
        const [min, max] = this.config.sleep_range;
        let rand = Math.floor(Math.random() * (max - min + 1) + min); //Generate Random number
        log(this.config, 1, `Sleeping for ${rand}s`);
        await this.sleep(rand * 1000);
    }

    /**
     *
     * @returns true if startpage was loaded correctly.
     */
    async load_start_page() {

    }

    /**
     * @returns true if proxy is enabled and working fine
     */
    async check_if_proxy_works() {

    }

    /**
     * Instructs the browser tab to wait and search for given selector before closing the window
     */
    async wait_for_results() {
        await this.page.waitForSelector('#pankaj-jha', { timeout: this.STANDARD_TIMEOUT });
    }

    /**
     * 
     * @returns true if google detected the page in english
     */
    async detected() {
        const title = await this.page.title();
        let html = await this.page.content();
        return html.indexOf('detected unusual traffic') !== -1 || title.indexOf('/sorry/') !== -1;
    }
};

module.exports = {
    Tracer: Tracer,
};
