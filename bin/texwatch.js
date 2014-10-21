#!/usr/bin/env node

var program = require("commander");
var path    = require("path");

var pkg     = require("../package.json");
var monitor = require("../lib/monitor");

program
  .version(pkg.version)
  .command("*")
  .description("Monitors a LaTeX project for changes")
  .action(function (file) {
    file = file || "./document.tex";
    var dir = path.dirname(file);
    monitor(dir, file);
    console.log("Watching", dir, "for changes...");
  });

program.parse(process.argv);
