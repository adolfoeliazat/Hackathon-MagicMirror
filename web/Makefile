SONAR_RUNNER_DIR=$(shell pwd)/CI/build/sonar-runner-2.4
BIN_SONAR_RUNNER=CI/bin/sonar-runner

default: npm

npm:
	npm install

test: npm
	gulp test

dist: npm
	gulp production

upload: dist
	./tools/deploy.sh

install-commit-hooks:
	cd .git/hooks && for i in ../../tools/git-hooks/*; do ln -fs $$i || true; done

clean-report:
	./tools/sonar/clean_xunit_report.sh reports

merge-lcov:
	./tools/sonar/merge_lcov.sh reports/phantomjs

sonar-runner: $(BIN_SONAR_RUNNER)
	SONAR_RUNNER_HOME=$(SONAR_RUNNER_DIR) $(BIN_SONAR_RUNNER)

$(BIN_SONAR_RUNNER):
	cd CI/build; curl -OL http://repo1.maven.org/maven2/org/codehaus/sonar/runner/sonar-runner-dist/2.4/sonar-runner-dist-2.4.zip; unzip sonar-runner-dist-2.4.zip
	ln -sf $(SONAR_RUNNER_DIR)/bin/sonar-runner $(BIN_SONAR_RUNNER)
	ln -sf $(shell pwd)/CI/conf/sonar-runner.properties $(SONAR_RUNNER_DIR)/conf/sonar-runner.properties

sonar-upload: clean-report merge-lcov sonar-runner
