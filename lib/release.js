var when = require('when'),
    semver = require('semver'),
    noop = when.resolve(true),
    shelljs = require('shelljs'),
    fs = require('fs');

function getVersion() {
    return JSON.parse(fs.readFileSync('version.json')).version;
}

function writeVersion(version) {
    jsonVersion = JSON.stringify(eval('('+`{ 'version' : "${version}" }`+')'));
    return fs.writeFileSync('version.json' , jsonVersion);
}

function gitAdd() {
    shelljs.exec('git add .');
}

function gitCommit(commitMessage) {
    shelljs.exec(`git commit -m \"${commitMessage}\"`);
}

function gitPush() {
    shelljs.exec('git push');
}

function gitTag(tag) {
    shelljs.exec(`git tag \"v${tag}\"`);
}

function gitPushTag() {
    shelljs.exec('git push origin --tags');
}

function removeSnapshot(version) {
    let cleanVersion = version;
    if(version.substr(version.length - 9, 9) === "-SNAPSHOT") {
        cleanVersion = version.slice(0, version.length - 9);
    }
    return cleanVersion;
}

function addSnapshot(version) {
    let cleanVersion;
    if(version.substr(version.length - 9, 9) === "-SNAPSHOT") {
        cleanVersion = version;
    } else {
        cleanVersion = version + "-SNAPSHOT";
    }
    return cleanVersion;
}

function IncVersion(version, type) {
    // TODO: Write Regex to detect Bad version 
    return semver.inc(removeSnapshot(version), type);
}

function afterRelease(version, incrementType) {
    const nextVersion = `${IncVersion(version, incrementType)}-SNAPSHOT`;
    writeVersion(nextVersion);
    gitAdd();
    gitCommit(`Bumping version to ${nextVersion}`);
    gitPush();
}

function execute(cliArguments) {
    const version = getVersion();
    const nonSnapshotVersion = removeSnapshot(version);
    const incrementType = (cliArguments.length > 2) ? cliArguments[2] : "minor";
    writeVersion(nonSnapshotVersion);
    gitAdd();
    gitCommit(`Bumping version to ${nonSnapshotVersion}`);
    gitPush();
    gitTag(nonSnapshotVersion);
    gitPushTag();
    afterRelease(version, incrementType); 
}

module.exports = {
    execute : execute
};