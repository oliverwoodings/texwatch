var watch = require("glob-watcher");
var path  = require("path");
var spawn = require("child_process").spawn;

module.exports = monitor;

function build(file) {
  var dirName = path.dirname(file);
  var docName = path.basename(file);

  console.log("Building", file, "...");

  //Invoke LaTeX
  var tex = spawn("pdflatex", [
    "-interaction=nonstopmode",
    docName
  ], {
    cwd: dirName,
    env: process.env
  });

  // Let the user know if LaTeX couldn't be found
  tex.on('error', function(err) {
    if (err.code === 'ENOENT') { 
      console.error("\npdflatex not found!\n");
    }
  });

  //Wait for LaTeX to finish
  tex.on("exit", function() {
    console.log("Done!");
  });
}

function monitor(dir, file) {
  watch(dir + "/**/*.tex", function () {
    build(file);
  });
}