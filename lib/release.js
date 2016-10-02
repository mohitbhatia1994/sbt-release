var semver = require('semver'),
  shelljs = require('shelljs'),
  fs = require('fs');
var prompt = require('prompt');

function getVersion() {
  return JSON.parse(fs.readFileSync('version.json')).version;
}

function writeVersion(version) {
  var jsonObj = {
    version: version
  };
  return fs.writeFileSync('version.json', JSON.stringify(jsonObj));
}

function gitAdd() {
  shelljs.exec('git add version.json');
}

function gitCommit(commitMessage) {
  shelljs.exec("git commit -m \"" + commitMessage + "\"");
}

function gitPush() {
  shelljs.exec('git push');
}

function gitTag(tag) {
  shelljs.exec("git tag \"v" + tag + "\"");
}

function gitPushTag() {
  shelljs.exec('git push origin --tags');
}

function removeSnapshot(version) {
  var cleanVersion = version;
  if (version.substr(version.length - 9, 9) === "-SNAPSHOT") {
    cleanVersion = version.slice(0, version.length - 9);
  }
  return cleanVersion;
}

function addSnapshot(version) {
  var cleanVersion;
  if (version.substr(version.length - 9, 9) === "-SNAPSHOT") {
    cleanVersion = version;
  } else {
    cleanVersion = version + "-SNAPSHOT";
  }
  return cleanVersion;
}

function IncVersion(version, type) {
  return semver.inc(removeSnapshot(version), type);
}

function afterRelease(version, incrementType) {
  var nextVersion = IncVersion(version, incrementType) + "-SNAPSHOT";
  writeVersion(nextVersion);
  gitAdd();
  gitCommit("Bumping version to " + nextVersion);
  gitPush();
}

function execute() {
  var version = getVersion();
  var nonSnapshotVersion = removeSnapshot(version);
  var incrementType = "patch";

  var schema = {
    properties: {
      version: {
        description: 'Version to release',
        default: nonSnapshotVersion,
        required: true
      }
    }
  };

  prompt.get(schema, function (err, result) {

    writeVersion(result.version);
    gitAdd();
    gitCommit("Bumping version to " + result.version);
    gitTag(result.version);
    gitPushTag();
    afterRelease(result.version, incrementType);
  });

  prompt.start();


}

module.exports = {
  execute: execute
};
