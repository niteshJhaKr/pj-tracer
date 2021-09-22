# pj-tracer

pj-tracer is a Node JS library to trace redirects/hops in a URL. It is a redirect checker which uses puppeteer to run end to end analysis for redirect hops of a URL.

Support Proxies, Useragents, Screensize and Evasion/Stealth techniques configuration to pass on to the puppeteer

## Installation

Use the package manager [npm](https://www.npmjs.com/package/npm) to install pj-tracer.

```bash
npm install pj-tracer
```

## Usage

```python
const pj_tracer = require('pj-tracer');

(async () => {
    // scrape config can change on each scrape() call
    let trace_config = {
        // an array of URLs to Trace
        urls: ['Your URL - https://someurl.com/example/123'],
        
        ignored_domains: [],
    };
    const browser = await puppeteer.launch(launchOptions);
    let results = await pj_tracer.trace(browser, browser_config, trace_config);
    console.dir(results, {depth: null, colors: true});
})();
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)