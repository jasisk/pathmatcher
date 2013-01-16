var PathMatcher = require('../');
var should = require('should');
var sinon = require('sinon');

function asyncEach(arr, callback) {
    (function asyncDone() {
        if ( arr.length ) {
            var singleCase = arr.shift();
            singleCase( asyncDone );
        } else {
            callback();
            return;
        }
    }());
}

describe('PathMatcher', function () {

    var regExFilter = /^\/testpath\/test\.tmp$/i;
    var regExPath = /^\/testpath$/i;
    var regExFile = /^test\.tmp$/i;

    describe('prototype', function() {

        describe('#_makeRegexFunction', function() {
            it('return a function that tests a RegExp', function() {
                var res = PathMatcher.prototype._makeRegexFunction(regExFilter);
                res.should.be.a('function');
                res('/testpath/test.tmp').should.equal.true;
                res('/omg/test.tmp').should.be.false;
            });
        });

        describe('#_sanitizeFilters', function() {
            var stub, _sF = PathMatcher.prototype._sanitizeFilters.bind(PathMatcher.prototype);

            before(function() {
                // Stub out _makeRegexFunction dependency
                stub = sinon.stub(PathMatcher.prototype, '_makeRegexFunction');
                stub.returnsArg(0);
            });

            beforeEach(function() {
                stub.reset();
            });

            after(function() {
                stub.restore();
            });

            it('only invalid inputs should throw', function () {
                _sF.should.throw();
                (function(){_sF("pizza");}).should.throw();
                (function(){_sF({omg: regExFilter});}).should.not.throw();
                (function(){_sF(function(){});}).should.not.throw();
            });

            it('(RegExp) should equal ({fullPath: RegExp})', function () {
                var res = _sF(regExFilter);
                var res2 = _sF({fullPath: regExFilter});
                res.should.eql(res2);
            });

            it('({fullPath: RegExp}) should call _makeRegexFunction', function () {
                var res = _sF({fullPath: regExFilter});
                stub.called.should.be.true;
                res.should.have.property('fullPath', regExFilter);
            });

            it('({fullPath: function(){}}) should be valid', function () {
                var func = function(omg){return omg;};
                var res = _sF({fullPath: func});
                res.fullPath("pizza").should.equal(func("pizza"));
            });

            it('({path: regExPath, file: regExFile}) should return two filters', function () {
                var res = _sF({path: regExPath, file: regExFile});
                Object.keys(res).should.have.length(2);
            });

            it('({path: regExPath, file: invalidType}) should return one filter', function () {
                var res = _sF({path: regExPath, file: 'omgomgomg'});
                Object.keys(res).should.have.length(1);
            });

        });


    });

    describe('Constructor', function() {
        var stub;
        before(function() {
            stub = sinon.stub(PathMatcher.prototype, '_sanitizeFilters');
            stub.returnsArg(0);
        });

        beforeEach(function() {
            stub.reset();
        });

        after(function() {
            stub.restore();
        });

        it('should set the internal _filter property', function() {
            var pm = new PathMatcher(regExFilter);
            pm._filters = regExFilter;
        });
    });

    describe('#match', function() {
        it('should be api consistant with node', function(done) {
            var pm = new PathMatcher(regExFilter);
            var cases = [
                function(done) {
                    pm.match(null, function(err, result) {
                        should.exist(err);
                        done();
                    });
                },
                function(done) {
                    pm.match('/omg/omg.omg', function(err, result) {
                        should.not.exist(err);
                        result.should.be.false;
                        done();
                    });
                },
                function(done) {
                    pm.match('/testpath/test.tmp', function(err, result) {
                        should.not.exist(err);
                        result.should.be.true;
                        done();
                    });
                }
            ];
            asyncEach(cases, done);
        });

        it('{path: ...} should only check the path', function(done) {
            var pm = new PathMatcher({path: regExPath});
            var cases = [
                function(done) {
                    pm.match('/testpath/omg.tmp', function(err, result) {
                        should.not.exist(err);
                        result.should.be.true;
                        done();
                    });
                },
                function(done) {
                    pm.match('/omgomg/test.tmp', function(err, result) {
                        should.not.exist(err);
                        result.should.be.false;
                        done();
                    });
                }
            ];
            asyncEach(cases, done);
        });
        it('{file: ...} should only check the filename', function(done) {
            var pm = new PathMatcher({file: regExFile});
            var cases = [
                function(done) {
                    pm.match('/testpath/omg.tmp', function(err, result) {
                        should.not.exist(err);
                        result.should.be.false;
                        done();
                    });
                },
                function(done) {
                    pm.match('/omgomg/test.tmp', function(err, result) {
                        should.not.exist(err);
                        result.should.be.true;
                        done();
                    });
                }
            ];
            asyncEach(cases, done);
        });

        it('should work with async function matchers', function(done) {
            var pm = new PathMatcher({fullPath: function(input, done){
                process.nextTick(function(){
                    done(regExFilter.test(input));
                });
            }});

            pm.match('/testpath/test.tmp', function(err, result) {
                should.not.exist(err);
                result.should.be.true;
                done();
            });
        });
        it('should work with sync function matchers', function(done) {
            var pm = new PathMatcher({fullPath: function(input){
                return regExFilter.test(input);
            }});

            pm.match('/testpath/test.tmp', function(err, result) {
                should.not.exist(err);
                result.should.be.true;
                done();
            });
        });
    });
    describe('#matchSync', function(){
        it.skip('should work exactly like match but block and return', function(){
            var pm = new PathMatcher({fullPath: function(input){
                return regExFilter.test(input);
            }});

            pm.matchSync('/testpath/test.tmp').should.be.true;
            pm.matchSync('/omgomg/omg.omg').should.be.false;
            (function(){pm.matchSync(null);}).should.throw();

        });
    });
});
