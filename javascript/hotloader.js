var exec, fs, spawn, sys;
exec = require('child_process').exec;
spawn = require('child_process').spawn;
fs = require('fs');
sys = require('sys');
exports.HotLoader = function() {
  function _Class(args) {
    this.args = args;
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
    var extName, match, self, typeOptions, watch;
    extName = "js";
    typeOptions = this.args.filter(function(arg) {
      return arg.match(/^-t=(.*)$/);
    });
    if (typeOptions.length > 0 && (match = typeOptions[typeOptions.length - 1].match(/^-t=(.*)/))) {
      extName = match[1];
    }
    self = this;
    watch = exec("find . -name \"*." + extName + "\"");
    watch.stdout.on("data", function(data) {
      var files, _fn, _i, _len, _results;
      files = data.split("\n");
      _fn = function(file) {
        return _results.push(file ? fs.watchFile(file, {
          interval: 100
        }, function(prev, curr) {
          if (Number(new Date(prev.mtime)) !== Number(new Date(curr.mtime))) {
            return self.restartProcess(file.replace(/\.\//, ""));
          }
        }) : void 0);
      };
      _results = [];
      for (_i = 0, _len = files.length; _i < _len; _i++) {
        file = files[_i];
        _fn(file);
      }
      return _results;
    });
    return this.startProcess();
  };
  _Class.prototype.startProcess = function() {
    var self;
    self = this;
    this.process = spawn("node", this.args.slice(2), {
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
}();