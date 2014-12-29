#!/usr/bin/env node

var program = require("commander");
var path    = require("path");

var pkg     = require("../package.json");
var monitor = require("../lib/monitor");

program
  .version(pkg.version)
  .description("Monitors a LaTeX project for changes")
  .parse(process.argv);

var file = path.resolve(program.args[0] || "./document.tex");
var dir = path.dirname(file);
monitor(dir, file);