var watch = require("glob-watcher");
var path  = require("path");
var lift  = require("when/node").lift;
var exec  = lift(require("exec"));
var _     = require("lodash");

require("colors");

module.exports = monitor;

function build(file) {
  var dirName = path.dirname(file);
  var docName = path.basename(file);

  console.log("Building", file, "...");

  var args = ["pdflatex", "-interaction=nonstopmode", docName];
  var opts = {
    cwd: dirName,
    env: process.env
  };
  return exec(args, opts)
    .spread(function (out, code) {
      if (code === 0) {
        console.log("\t- Done!".green);
      } else {
        out = out.split("\n");
        console.error("Error compiling LaTeX output:");
        out.forEach(function (line) {
          if (line.substr(0, 1) === "!") {
            console.error("\t", line);
          }
        });
      }
    });
}

function spellcheckReport(lines) {

  return _.reduce(lines, processLine, {});

  function processLine(report, line) {
    var command = line.substring(0, 1);
    var parts;
    switch (command) {
      // Miss
      case "&":
        parts = line.match(/^\&\s(.+?)\s(\d+)\s(\d+)\:\s(.+)$/);
        var original = parts[1];
        var misses = parts[4].split(", ");
        report[original] = misses;
        break;

      // None
      case "#":
        parts = line.match(/^\#\s(.+?)\s/);
        report[parts[1]] = [];
        break;

    }
    return report;
  }

}

function spellcheck(file) {
  var dirName = path.dirname(file);

  console.log("Running spellcheck on all .tex files in", dirName, "...");

  var cmd = "hunspell -l -t -a *.tex */*.tex";
  var opts = {
    cwd: dirName,
    env: process.env
  };
  return exec(cmd, opts)
    .spread(function (out) {
      var report = spellcheckReport(out.split("\n"));

      _.each(report, function (suggested, original) {
        var suggestedText = suggested.length === 0 ? "No suggestions".italic.red : suggested.join(", ").yellow;
        console.log("\t- Original:", original.cyan, "\tSuggested:", suggestedText);
      });

      console.log("\t- Done!".green);
    });
}

function monitor(dir, file) {
  watch(dir + "/**/*.tex", run);
  run();
  
  function run() {
    build(file)
      .then(spellcheck.bind(null, file))
      .then(function () {
        console.log("Watching", dir, "for changes...");
      });
  }
}