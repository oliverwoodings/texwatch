var watch  = require("glob-watcher");
var path   = require("path");
var lift   = require("when/node").lift;
var exec   = lift(require("exec"));
var _      = require("lodash");
var rmrf   = lift(require("rimraf"));
var write  = lift(require("fs").writeFile);
var format = require("util").format;

require("colors");


function Monitor(options) {
  this.options = _.extend({}, Monitor.DEFAULTS, options);
}

Monitor.DEFAULTS = {
  log: false,
  watchGlob: "**/*.tex",
  dir: "./",
  file: "document.tex",
  personalDictionary: [],
  tmpDictFile: path.resolve(__dirname, ".texwatchtmpdict"),
  dictionary: "en_GB",
  spellCheck: true
};

Monitor.prototype.start = function () {
  watch(path.resolve(this.options.dir, this.options.watchGlob), this._run.bind(this));
  this._run();
};

Monitor.prototype.log = function () {
  if (this.options.log) {
    console.log.apply(console, arguments);
  }
};

Monitor.prototype._run = function () {
  var self = this;
  this._build()
    .then(this._compileDictionary.bind(this))
    .then(this._spellCheck.bind(this))
    .then(this._removeDictionary.bind(this))
    .finally(function () {
      self.log(format("Watching %s/%s for changes...", self.options.dir, self.options.file));
    });
};

Monitor.prototype._build = function () {
  var self = this;
  this.log(format("Building %s...", this.options.file));

  var args = ["pdflatex", "-interaction=nonstopmode", this.options.file];
  if (this.options.texCommand) {
    args = this.options.texCommand;
  }
  var opts = {
    cwd: this.options.dir,
    env: process.env
  };
  return exec(args, opts)
    .spread(function (out, code) {
      if (code === 0) {
        self.log("\t- Done!".green);
      } else {
        out = out.split("\n");
        self.log("Error compiling LaTeX output:".red);
        out.forEach(function (line) {
          if (line.substr(0, 1) === "!") {
            self.log("\t", line.red);
          }
        });
      }
    });
};

Monitor.prototype._compileDictionary = function () {
  var dict = this.options.personalDictionary || [];
  return write(this.options.tmpDictFile, dict.join("\n"));
};

Monitor.prototype._removeDictionary = function () {
  return rmrf(this.options.tmpDictFile);
};

Monitor.prototype._reportSpellingError = function (report, line) {
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
};

Monitor.prototype._spellCheck = function () {
  var self = this;

  if (!this.options.spellCheck) {
    this.log("Spell check disabled, skipping");
    return false;
  }

  this.log(format("Running spellcheck on all .tex files in %s...", this.options.dir));

  var cmd = format("hunspell -t -p %s -d %s -a *.tex */*.tex", this.options.tmpDictFile, this.options.dictionary);
  var opts = {
    cwd: this.options.dir,
    env: process.env
  };
  return exec(cmd, opts)
    .spread(function (out) {
      var report = _.reduce(out.split("\n"), self._reportSpellingError.bind(self), {});

      _.each(report, function (suggested, original) {
        var suggestedText = suggested.length === 0 ? "No suggestions".italic.red : suggested.join(", ").yellow;
        self.log(format("\t- Original: %s \t\tSuggested: %s", original.cyan, suggestedText));
      });

      self.log("\t- Done!".green);
    });
};

module.exports = Monitor;