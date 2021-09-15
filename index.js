const pj_tracer = require('./src/node_tracer.js');
var Tracer = require('./src/modules/tracer_module');

async function trace(browser, browser_config, trace_config) {
    // scrape config overwrites the browser_config
    Object.assign(browser_config, trace_config);

    var tracer = new pj_tracer.TraceManager(browser, browser_config);

    await tracer.start();

    var results = await tracer.trace(trace_config);

    await tracer.quit();

    return results;
}

module.exports = {
    trace: trace,
    TraceManager: pj_tracer.TraceManager,
    Tracer: Tracer,
};
