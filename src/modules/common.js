var wildstring = require('wildstring');

function log(config, loglevel, msg = null, cb = null) {
    if (typeof loglevel != "number") {
        throw Error('loglevel must be numeric.');
    }

    if (loglevel <= config.debug_level) {
        if (msg) {
            if (typeof msg == 'object') {
                console.dir(msg, {depth: null, colors: false});
            } else {
                console.log('[i] ' + msg);
            }
        } else if (cb) {
            cb();
        }
    }
}

function checkIfInIgnoredDomains(config, url) {
    var ignoredUrls = config.ignored_plain_urls;
    var ignoredWildcardDomains = config.ignored_wildcard_domains;
    return (ignoredUrls.some(v => url.includes(v)) || matchIgnoredUrls(ignoredWildcardDomains, url) );
}

function matchIgnoredUrls(ignoredWildcardDomains, url){
    return ignoredWildcardDomains.some(function (arrVal) {
        return wildstring.match(arrVal, url);
    });
}

module.exports = {
    log: log,
    isIgnoredDomain: checkIfInIgnoredDomains,
};