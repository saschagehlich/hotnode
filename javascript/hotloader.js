var _a, exec, fs, spawn;
exec = require('child_process').exec;
spawn = require('child_process').spawn;
fs = require('fs');
exports.HotLoader = (function() {
  _a = function(args) {
    this.args = args;
    return this;
  };
  _a.prototype.output = function(message, good) {
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
  _a.prototype.stderrOutput = function(message) {
    var output;
    output = ("\033[0;31m" + (message) + "\033[m");
    return console.log(output);
  };
  _a.prototype.growl = function(message, title) {
    return exec("growlnotify -m \"" + (message) + "\" -t \"" + (title) + "\" --image " + (__dirname) + "/nodejs.png");
  };
  _a.prototype.run = function() {
    var extName, match, self, watch;
    extName = (match = this.args[this.args.length - 1].match(/^-t=(.*)/)) ? match[1] : "js";
    self = this;
    watch = exec("find . -name \"*." + (extName) + "\"");
    watch.stdout.on("data", function(data) {
      var _b, _c, _d, _e, files;
      files = data.split("\n");
      _b = []; _d = files;
      for (_c = 0, _e = _d.length; _c < _e; _c++) {
        (function() {
          var file = _d[_c];
          return _b.push(file ? fs.watchFile(file, {
            interval: 100
          }, function(prev, curr) {
            return Number(new Date(prev.mtime)) !== Number(new Date(curr.mtime)) ? self.restartProcess(file.replace(/\.\//, "")) : null;
          }) : null);
        })();
      }
      return _b;
    });
    return this.startProcess();
  };
  _a.prototype.startProcess = function() {
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
  _a.prototype.restartProcess = function(filename) {
    var _b;
    if (typeof (_b = this.process) !== "undefined" && _b !== null) {
      try {
        this.process.kill("SIGKILL");
      } catch (e) {
        this.output("Exception: " + (e.message), false);
      }
    }
    this.output("" + (filename) + " changed", false);
    return this.startProcess();
  };
  return _a;
})();