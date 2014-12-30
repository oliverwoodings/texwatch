#!/usr/bin/env node

var program = require("commander");
var path    = require("path");
var fs      = require("fs");
var _       = require("lodash");

var pkg     = require("../package.json");
var Monitor = require("../lib/monitor");

// Create the CLI program
program
  .version(pkg.version)
  .description("Monitors a LaTeX project for changes")
  .parse(process.argv);

// Extract directory and filename from args, or use default
var fullPath = path.resolve(program.args[0] || "./document.tex");
var opts = {
  log: true,
  dir: path.dirname(fullPath),
  file: path.basename(fullPath)
};

// Read settings from .texwatchrc file if it exists
var rc = {};
var rcFile = path.resolve(opts.dir, ".texwatchrc");
if (fs.existsSync(rcFile)) {
  rc = JSON.parse(fs.readFileSync(rcFile, "utf-8"));
}

// Start monitoring
var monitor = new Monitor(_.extend({}, opts, rc));
monitor.start();