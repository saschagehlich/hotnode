var exec, fs, spawn, util, watch;

exec = require('child_process').exec;

spawn = require('child_process').spawn;

fs = require('fs');

util = require('util');

watch = require('watch');

exports.HotLoader = (function() {

  function _Class(args, extName, launcher) {
    var arg, extOptions, i, launcherOptions, match, _len, _len2, _ref, _ref2;
    this.extName = extName;
    this.launcher = launcher;
    this.args = args;
    this.passedArguments = this.args.slice(2);
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
        if (arg === ("-t=" + match[1])) this.passedArguments.splice(i, 1);
      }
    }
    if (launcherOptions.length > 0 && (match = launcherOptions[launcherOptions.length - 1].match(/^-l=(.*)/))) {
      this.launcher = match[1];
      _ref2 = this.passedArguments;
      for (i = 0, _len2 = _ref2.length; i < _len2; i++) {
        arg = _ref2[i];
        if (arg === ("-l=" + match[1])) this.passedArguments.splice(i, 1);
      }
    }
  }

  _Class.prototype.output = function(message, type) {
    var output;
    output = "\033[0;30mhotnode: \033[1;";
    switch (type) {
      case "good":
        output += "32m";
        break;
      case "bad":
        output += "31m";
        break;
      case "info":
        output += "35m";
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
    if (process.env.DESKTOP_SESSION && ~process.env.DESKTOP_SESSION.indexOf("gnome")) {
      return exec("notify-send --hint=int:transient:1 --icon " + __dirname + "/nodejs.png \"" + title + "\" \"" + message + "\" ");
    } else {
      return exec("growlnotify -m \"" + message + "\" -t \"" + title + "\" --image " + __dirname + "/nodejs.png");
    }
  };

  _Class.prototype.run = function() {
    var _this = this;
    watch.watchTree('./', function(f, curr, prev) {
      var regex;
      regex = "\.coffee$";
      if (RegExp(regex).test(f)) {
        if (typeof f === "object" && prev === null && curr === null) {} else if (prev === null) {
          _this.output("New file: " + f, "info");
          return _this.restartProcess();
        } else if (curr.nlink === 0) {
          _this.output("" + f + " has been deleted", "info");
          return _this.restartProcess();
        } else {
          _this.output("" + f + " has been changed", "info");
          return _this.restartProcess();
        }
      }
    });
    return this.startProcess();
  };

  _Class.prototype.startProcess = function() {
    var _this = this;
    this.process = spawn(this.launcher, this.passedArguments, {
      env: process.env
    });
    this.process.stdout.on("data", function(data) {
      return util.print(data.toString());
    });
    this.process.stderr.on("data", function(data) {
      return self.stderrOutput(data.toString());
    });
    this.output("" + this.launcher + " process restarted", "good");
    return this.growl("" + this.launcher + " process restarted", "Hot" + this.launcher);
  };

  _Class.prototype.restartProcess = function() {
    if (this.process != null) {
      try {
        this.process.kill("SIGKILL");
      } catch (e) {
        this.output("Exception: " + e.message, "bad");
      }
    }
    return this.startProcess();
  };

  return _Class;

})();
