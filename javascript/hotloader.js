var _ctor, exec, fs, spawn;
exec = require('child_process').exec;
spawn = require('child_process').spawn;
fs = require('fs');
exports.HotLoader = (function() {
  _ctor = function(args) {
    this.args = args;
    return this;
  };
  _ctor.prototype.output = function(message, good) {
    var output, self;
    self = this;
    output = "\033[0;30mhotnode: \033[1;";
    if (good) {
      output += "32m";
    } else {
      output += "31m";
    }
    output += ("" + (message) + "\033[m");
    return console.log(output);
  };
  _ctor.prototype.stderrOutput = function(message) {
    var output;
    output = ("\033[0;31m" + (message) + "\033[m");
    return console.log(output);
  };
  _ctor.prototype.growl = function(message, title) {
    return exec("growlnotify -m \"" + (message) + "\" -t \"" + (title) + "\" --image " + (__dirname) + "/nodejs.png");
  };
  _ctor.prototype.run = function() {
    var self, watch;
    self = this;
    watch = exec("find . -name \"*.js\"");
    watch.stdout.on("data", function(data) {
      var _i, _len, _ref, _result, files;
      files = data.split("\n");
      _result = []; _ref = files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        (function() {
          var file = _ref[_i];
          return _result.push(file ? fs.watchFile(file, {
            interval: 100
          }, function(prev, curr) {
            return Number(new Date(prev.mtime)) !== Number(new Date(curr.mtime)) ? self.restartProcess(file.replace(/\.\//, "")) : null;
          }) : null);
        })();
      }
      return _result;
    });
    return this.startProcess();
  };
  _ctor.prototype.startProcess = function() {
    var self;
    self = this;
    this.process = spawn("node", this.args.slice(2), {
      env: process.env
    });
    this.process.stdout.on("data", function(data) {
      return console.log(data.toString());
    });
    this.process.stderr.on("data", function(data) {
      return self.stderrOutput(data.toString(), false);
    });
    this.output("Node.js process restarted", true);
    return this.growl("Node.js process restarted", "Hotnode");
  };
  _ctor.prototype.restartProcess = function(filename) {
    var _ref;
    if (typeof (_ref = this.process) !== "undefined" && _ref !== null) {
      try {
        this.process.kill("SIGKILL");
      } catch (e) {
        this.output("Exception: " + (e.message), false);
      }
    }
    this.output("" + (filename) + " changed", false);
    return this.startProcess();
  };
  return _ctor;
})();