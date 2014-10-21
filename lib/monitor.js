var watch = require("glob-watcher");
var path  = require("path");
var lift  = require("when/node").lift;
var exec  = lift(require("exec"));

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
  exec(args, opts)
    .spread(function (out, code) {
      if (code === 0) {
        console.log("Done!");
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

function monitor(dir, file) {
  watch(dir + "/**/*.tex", function () {
    build(file);
  });
}