#!/usr/bin/env node

const fs = require('fs');
var release = require('../lib/release');
var semver = release.semver;
release.execute(process.argv);