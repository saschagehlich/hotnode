var exec, fs, spawn, sys;
exec = require('child_process').exec;
spawn = require('child_process').spawn;
fs = require('fs');
sys = require('sys');
exports.HotLoader = (function() {
  function _Class(args) {
    var arg, extOptions, i, launcherOptions, match, _len, _len2, _ref, _ref2;
    this.args = args;
    this.passedArguments = this.args.slice(2);
    this.extName = "js";
    this.launcher = "node";
    extOptions = this.args.filter(function(arg) {
      return arg.match(/^-t=(.*)$/);
    });
    launcherOptions = this.args.filter(function(arg) {
      return arg.match(/^-l=(.*)$/);
    });
    if (extOptions.length > 0 && (match = extOptions[extOptions.length - 1].match(/^-t=(.*)/))) {
      this.extName = match[1];
      _ref = this.passedArguments;
      for (i = 0, _len = _ref.length; i < _len; i++) {
        arg = _ref[i];
        if (arg === ("-t=" + match[1])) {
          this.passedArguments.splice(i, 1);
        }
      }
    }
    if (launcherOptions.length > 0 && (match = launcherOptions[launcherOptions.length - 1].match(/^-l=(.*)/))) {
      this.launcher = match[1];
      _ref2 = this.passedArguments;
      for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
        arg = _ref2[i];
        if (arg === ("-l=" + match[1])) {
          this.passedArguments.splice(i, 1);
        }
      }
    }
  }
  _Class.prototype.output = function(message, good) {
    var output, self;
    self = this;
    output = "\033[0;30mhotnode: \033[1;";
    if (good) {
      output += "32m";
    } else {
      output += "31m";
    }
    output += "" + message + "\033[m";
    return console.log(output);
  };
  _Class.prototype.stderrOutput = function(message) {
    var output;
    output = "\033[0;31m" + message + "\033[m";
    return console.log(output);
  };
  _Class.prototype.growl = function(message, title) {
    return exec("growlnotify -m \"" + message + "\" -t \"" + title + "\" --image " + __dirname + "/nodejs.png");
  };
  _Class.prototype.run = function() {
    var self, watch;
    self = this;
    watch = exec("find . -name \"*." + this.extName + "\"");
    watch.stdout.on("data", function(data) {
      var file, files, _i, _len, _results;
      files = data.split("\n");
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        _results.push(file ? fs.watchFile(file, {
          interval: 100
        }, function(prev, curr) {
          if (Number(new Date(prev.mtime)) !== Number(new Date(curr.mtime))) {
            return self.restartProcess(file.replace(/\.\//, ""));
          }
        }) : void 0);
      }
      return _results;
    });
    return this.startProcess();
  };
  _Class.prototype.startProcess = function() {
    var self;
    self = this;
    this.process = spawn(this.launcher, this.passedArguments, {
      env: process.env
    });
    this.process.stdout.on("data", function(data) {
      return sys.print(data.toString());
    });
    this.process.stderr.on("data", function(data) {
      return self.stderrOutput(data.toString(), false);
    });
    this.output("Node.js process restarted", true);
    return this.growl("Node.js process restarted", "Hotnode");
  };
  _Class.prototype.restartProcess = function(filename) {
    if (this.process != null) {
      try {
        this.process.kill("SIGKILL");
      } catch (e) {
        this.output("Exception: " + e.message, false);
      }
    }
    this.output("" + filename + " changed", false);
    return this.startProcess();
  };
  return _Class;
})();