'use strict';
var fs = require('fs');
var os = require("os");

const tracer_module = require('./modules/tracer_module.js');
const common = require('./modules/common.js');
var log = common.log;

function getTracer(args) {
    return new tracer_module.Tracer(args);
}

class TraceManager {

    constructor(browser, config, context={}) {
        this.tracer = null;
        this.context = context;
        this.browser = browser;

        this.config = {
            // the user agent to trace with
            user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3835.0 Safari/537.36',
            //Which Device Type to use
            device: 'Desktop',
            device_specs: {
                width: 1920,
                height: 1080,
            },
            // whether debug information should be printed
            // level 0: print nothing
            // level 1: print most important info
            // ...
            // level 4: print all shit nobody wants to know
            debug_level: 1,
            //URL array for tracing
            urls: ['https://www.google.com/aclk?sa=L&ai=DChcSEwiUttOb4f3yAhWVC5EKHU9kBssYABAAGgJjZQ&ei=wDZAYcrAHrrV1sQPkIqI4AY&sig=AOD64_3fp2ZbAbB9uuvnSLpPiMhsztm9wA&q&sqi=2&adurl&ved=2ahUKEwjKoMub4f3yAhW6qpUCHRAFAmwQ0Qx6BAgCEAE',],
            //Domains to ignore while tracing, these domains will not be discarded from the end-results for further tracing
            ignored_plain_urls:[],
            ignored_wildcard_domains:[],
            // whether to start the browser in headless mode
            headless: true,
            // specify flags passed to chrome here
            chrome_flags: [],
            // path to output file, data will be stored in JSON
            output_file: '',
            // whether to return a screenshot of serp pages as b64 data
            screen_output: false,
            //Block Static Resources
            block_assets: true,
            //Throw Error if Detected as Bot
            throw_on_detection: false,
        };

        // overwrite default config
        for (var key in config) {
            this.config[key] = config[key];
        }
    }

    /*
     * Launches the puppeteer cluster or browser.
     *
     * Returns true if the browser was successfully launched. Otherwise will return false.
     */
    async start() {
        try{
            this.config.device_specs = await this.getResolution(this.config.device)
        } catch(error){
            console.log(error)
        }
        
        this.page = await this.browser.newPage();
    }

    async getResolution(device) {
        if(device == 'Desktop'){
            return {
                width: 1920,
                height: 1080
            }
        } else if(device == 'Mobile'){
            return {
                width: 480,
                height: 320
            }
        } else{
            return {
                width: 800,
                height: 1280
            }
        }
    }

    /*
     * Traces the URL specified by the config.
     */
    async trace(trace_config = {}) {

        if (!trace_config.urls) {
            console.error('URLs must be supplied to trace()');
            return false;
        }

        Object.assign(this.config, trace_config);

        var results = {};
        var num_requests = 0;
        var metadata = {};
        var startTime = Date.now();

        if (this.config.urls) {
            log(this.config, 1,
                `[pj-tracer] started at [${(new Date()).toUTCString()}] and traces ${this.config.urls.length} urls.`)
        }

        this.tracer = getTracer({
            config: this.config,
            context: this.context,
            page: this.page,
        });

        var {results, metadata, num_requests} = await this.tracer.run(this.page);


        let timeDelta = Date.now() - startTime;
        let ms_per_request = timeDelta/num_requests;

        log(this.config, 1, `Tracer took ${timeDelta}ms to perform ${num_requests} requests.`);
        log(this.config, 1, `On average ms/request: ${ms_per_request}ms/request`);

        metadata.elapsed_time = timeDelta.toString();
        metadata.ms_per_keyword = ms_per_request.toString();
        metadata.num_requests = num_requests;

        log(this.config, 2, metadata);

        if (this.config.output_file) {
            log(this.config, 1, `Writing results to ${this.config.output_file}`);
            write_results(this.config.output_file, JSON.stringify(results, null, 4));
        }

        return {
            results: results,
            metadata: metadata || {},
        };
    }

    /*
     * Quit the puppeteer cluster/browser.
     */
    async quit() {
        this.page.close();
    }
}

module.exports = {
    TraceManager: TraceManager,
};