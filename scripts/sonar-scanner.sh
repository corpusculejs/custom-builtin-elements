#!/usr/bin/env bash

if [[ "${GITHUB_OS}" == "windows-latest" ]]; then
  export OS_TYPE=windows
fi

if [[ "${GITHUB_OS}" == "macOS-latest" ]]; then
  export OS_TYPE=macosx
fi

export SONAR_SCANNER_HOME=$HOME/.sonar/sonar-scanner-$SONAR_SCANNER_VERSION-$OS_TYPE

rm -rf $SONAR_SCANNER_HOME
mkdir -p $SONAR_SCANNER_HOME

curl -sSLo $HOME/.sonar/sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-$SONAR_SCANNER_VERSION-$OS_TYPE.zip
unzip $HOME/.sonar/sonar-scanner.zip -d $HOME/.sonar/

rm $HOME/.sonar/sonar-scanner.zip

export PATH=$SONAR_SCANNER_HOME/bin:$PATH
export SONAR_SCANNER_OPTS="-server"

cd $GITHUB_WORKSPACE
sonar-scanner -Dsonar.login=$SONAR_TOKEN
