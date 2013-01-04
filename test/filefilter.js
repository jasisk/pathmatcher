var FileFilter = require('../');
var should = require('should');

describe('FileFilter', function () {

    var regExFilter = /^\/testpath\/test\.tmp$/i;
    var regExPath = /^\/testpath$/i;
    var regExFile = /^test\.tmp$/i;

    describe('initialization', function() {

        it('new FileFilter() should throw', function (done) {
            var ff = new FileFilter(regExFilter);

            ff.should.throw();
            done();
        });

        it('new FileFilter({fullPath: regExFilter})', function (done) {
            var ff = new FileFilter({fullPath: regExFilter}),
                filters = ff._filters;

            ff.should.be.an.instanceOf(FileFilter);
            should.exist(filters);
            filters.should.eql({ fullPath: regExFilter });

            done();
        });

        it('new FileFilter({path: regExPath})', function (done) {
            var ff = new FileFilter({path: regExPath}),
                filters = ff._filters;

            ff.should.be.an.instanceOf(FileFilter);
            should.exist(filters);
            filters.should.eql({ path: regExPath });

            done();
        });

        it('new FileFilter({path: regExPath, file: regExFile})', function (done) {
            var ff = new FileFilter({path: regExPath, file: regExFile}),
                filters = ff._filters;

            ff.should.be.an.instanceOf(FileFilter);
            should.exist(filters);
            filters.should.eql({path: regExPath, file: regExFile});

            done();
        });

        it('new FileFilter(regExFilter) should equal { fullPath: regExFilter }', function (done) {
            var ff = new FileFilter(regExFilter),
                ff2 = new FileFilter({fullPath: regExFilter}),
                filters = ff._filters,
                filters2 = ff2._filters;

            ff.should.be.an.instanceOf(FileFilter);
            should.exist(filters);
            filters.should.eql(filters2);

            done();
        });

    });

    describe('match', function() {

        it('should compare against fullPath', function(done) {
            var ff = new FileFilter(regExFilter);
            ff.match('/testpath/test.tmp', function(err) {
                should.not.exist(err);
                done();
            });
        });

        it('should compare against path', function(done) {
            var ff = new FileFilter({path: regExPath});
            ff.match('/testpath/omgomgomg.tmp', function(err) {
                should.not.exist(err);
                ff.match('/omgomgomg/test.tmp', function(err) {
                    should.exist(err);
                    done();
                });
            });
        });

        it('should compare against file', function(done) {
            var ff = new FileFilter({file: regExFile});
            ff.match('/omgomgomg/test.tmp', function(err) {
                should.not.exist(err);
                ff.match('/testpath/omgomgomg.tmp', function(err) {
                    should.exist(err);
                    done();
                });
            });
        });

        it('should compare against many rules', function(done) {
            var ff = new FileFilter({fullPath: regExFilter, file: regExFile});
            ff.match('/testpath/test.tmp', function(err) {
                should.not.exist(err);
                done();
            });
        });

        it('should fail if any rule fails', function(done) {
            var regExFile = /omg\.tmp/i,
                ff = new FileFilter({fullPath: regExPath, file: regExFile});
            ff.match('/testpath/test.tmp', function(err) {
                should.exist(err);
                done();
            });
        });

        it('should work with non-callback style', function() {
            var ff = new FileFilter(regExFilter);
            ff.match('/testpath/test.tmp').should.be.true;
            ff.match('/testpath/omg.tmp').should.be.false;
        });

    });

});
