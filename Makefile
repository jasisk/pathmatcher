MOCHA_OPTS =
REPORTER = spec

check: test

test: test-unit

test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		$(MOCHA_OPTS)

test-w:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		--growl \
		--watch \
		$(MOCHA_OPTS)

test-cov: lib-cov
	@PATHMATCHER_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage --no-highlight lib lib-cov

clean:
	rm -f coverage.html
	rm -rf lib-cov

.PHONY: test test-unit test-w test-cov clean