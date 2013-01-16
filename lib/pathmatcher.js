var path = require('path'),
    util = require('util');

var PathMatcher = module.exports = function (filters) {
    this._filters = this._sanitizeFilters(filters);
};

PathMatcher.prototype._makeRegexFunction = function (regex) {
    return function(input) {
        return regex.test(input);
    };
};

PathMatcher.prototype._sanitizeFilters = function (filters) {
    var processedFilters = {}, self = this;
    if (util.isRegExp(filters)) {
        processedFilters.fullPath = self._makeRegexFunction(filters);
    } else if (typeof filters === 'function') {
        processedFilters.fullPath = filters;
    } else if (typeof filters === 'object') {
        Object.keys(filters).forEach(function (v, i, a) {
            if (util.isRegExp(filters[v])) {
                processedFilters[v] = self._makeRegexFunction(filters[v]);
            } else if (typeof filters[v] === 'function') {
                processedFilters[v] = filters[v];
            }
        });
    }
    if (!Object.keys(processedFilters).length) {
        throw new Error('Invalid filter specified');
    }
    return processedFilters;
};

PathMatcher.prototype.match = function (file, callback) {

    function getPart(key) {
        var parts = {
            file: path.basename(file),
            path: path.dirname(file)
        };
        
        return parts[key] ? parts[key] : file;
    }

    if (file == null) {
        callback(new Error('Nothing to match'));
        return;
    }

    var keys = Object.keys(this._filters);

    var checkFilter = (function(prev) {
        var key;
        if (prev === false) {
            callback(null, prev);
            return;
        }
        if (key = keys.shift()) {
            if (this._filters[key].length === 2) {
                this._filters[key].call(this, getPart(key), checkFilter);
            } else {
                if (this._filters[key].call(this, getPart(key))) {
                    process.nextTick(checkFilter);
                } else {
                    callback(null, false);
                }
            }
        } else {
            callback(null, true);
        }
    }).bind(this);
    process.nextTick(checkFilter);
};