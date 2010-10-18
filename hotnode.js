var HotLoader, _ctor, args, exec, file, fs, path;
exec = require('child_process').exec;
fs = require('fs');
path = require('path');
HotLoader = (function() {
  _ctor = function(command) {
    this.command = command;
    this.files = {};
    this.changedFile = "No files";
    return this;
  };
  _ctor.prototype.command = "";
  _ctor.prototype.process = null;
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
          var fileStat;
          var file = _ref[_i];
          return _result.push((function() {
            if (file) {
              fileStat = fs.statSync(file);
              self.files[fileStat.ino] = file;
            }
            return fs.watchFile(file, {
              interval: 100
            }, function(prev, curr) {
              var currMtime, file, prevMtime;
              prevMtime = Number(new Date(prev.mtime));
              currMtime = Number(new Date(curr.mtime));
              if (prevMtime !== currMtime) {
                file = self.files[curr.ino];
                self.changedFile = file.replace(/\.\//, "");
                return self.restartProcess();
              }
            });
          })());
        })();
      }
      return _result;
    });
    return this.startProcess();
  };
  _ctor.prototype.startProcess = function() {
    this.process = exec(this.command);
    this.process.stdout.on("data", function(data) {
      return console.log(data);
    });
    this.process.stderr.on("data", function(data) {
      return console.log("\033[1;30m=== \033[1;31m" + (data) + "\033[m");
    });
    return console.log("\033[1;30m=== \033[1;32mNode.js process restarted\033[m");
  };
  _ctor.prototype.restartProcess = function() {
    var _ref;
    if (typeof (_ref = this.process) !== "undefined" && _ref !== null) {
      try {
        this.process.kill("SIGKILL");
      } catch (e) {
        console.log("\033[1;30m=== \033[1;31mException: " + (e.message) + "\033[m");
      }
    }
    console.log("\033[1;30m=== \033[1;31m" + (this.changedFile) + " changed\033[m");
    this.startProcess();
    return exec("growlnotify -m \"" + (this.changedFile) + " changed\" -t \"Node.js restarted\" --image ./nodejs.png");
  };
  return _ctor;
})();
args = process.argv;
if (args.length > 2) {
  file = args[2];
  path.exists(file, function(exists) {
    var command, loader;
    if (exists) {
      command = ("node ./" + (file));
      loader = new HotLoader(command);
      return loader.run(command);
    } else {
      return console.log("\033[1;31m" + (file) + " does not exist!\033[m");
    }
  });
} else {
  console.log("\033[1;31mNo file given!\033[m");
  console.log("Usage:");
  console.log("   hotnode <file>");
}