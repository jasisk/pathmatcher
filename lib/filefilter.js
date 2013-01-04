var path = require('path'),
    util = require('util');

var FileFilter = module.exports = function (filters) {
    this._filters = this._sanitizeFilters(filters);    
};

FileFilter.prototype._sanitizeFilters = function (filters) {
    var processedFilters = {};
    if (util.isRegExp(filters)) {
        processedFilters.fullPath = filters;
    } else if (typeof filters === 'object') {
        ['file', 'path', 'fullPath'].forEach(function (v, i, a) {
            if (util.isRegExp(filters[v])) {
                processedFilters[v] = filters[v];
            }
        });
    }
    if (!Object.keys(processedFilters).length) {
        throw new Error('Invalid filter specified');
    }
    return processedFilters;
};

FileFilter.prototype.match = function (file, callback) {
    var parts = {
            fullPath: file,
            file: path.basename(file),
            path: path.dirname(file)
        };

    function filtersMatch(parts, filters) {
        var keys = Object.keys(parts);
        for (var i = 0, key, value, filter; i < keys.length; i++) {
            key = keys[i];
            value = parts[key];
            filter = filters[key];
            if (value && filter) {
                if (!value.match(filter)) {
                    return false;
                }
            }
        }
        return true;
    }

    var matched = filtersMatch(parts, this._filters);

    if (typeof callback === 'function') {
        // fake-ish async because why not
        function callbackWrap(err) {
            if (!matched) {
                err = new Error('Filter mismatch');
            }
            callback(err);
        }
        process.nextTick(callbackWrap);
        return;
    }
    return matched;
};