exec = require('child_process').exec
spawn = require('child_process').spawn
fs = require('fs')
util = require('util')

exports.HotLoader = class
  constructor: (args, @extName, @launcher) ->
    @args = args

    @passedArguments = @args.slice 2

    extOptions = @args.filter (arg) ->
      arg.match /^-t=(.*)$/
    launcherOptions = @args.filter (arg) ->
      arg.match /^-l=(.*)$/

    if extOptions.length > 0 and match = extOptions[extOptions.length-1].match /^-t=(.*)/
      @extName = match[1]

      for arg, i in @passedArguments when arg is "-t=#{match[1]}"
        @passedArguments.splice i, 1

    if launcherOptions.length > 0 and match = launcherOptions[launcherOptions.length-1].match /^-l=(.*)/
      @launcher = match[1]

      for arg, i in @passedArguments when arg is "-l=#{match[1]}"
        @passedArguments.splice i, 1

  # Output functions
  output: (message, good) ->
    self = this
    output = "\033[0;30mhotnode: \033[1;"
    if good
      output += "32m"
    else
      output += "31m"

    output += "#{message}\033[m"

    console.log output

  stderrOutput: (message) ->
    output = "\033[0;31m#{message}\033[m"
    console.log output

  growl: (message, title) ->
    if process.env.DESKTOP_SESSION and process.env.DESKTOP_SESSION.indexOf("gnome") != -1
      exec "notify-send --hint=int:transient:1 --icon #{__dirname}/nodejs.png \"#{title}\" \"#{message}\" "
    else
      exec "growlnotify -m \"#{message}\" -t \"#{title}\" --image #{__dirname}/nodejs.png"

  # File watching functions
  run: ->
    self = this
    watch = exec "find . -name \"*.#{@extName}\""
    watch.stdout.on "data", (data) ->
      files = data.split "\n"
      for file in files
        if file
          fs.watchFile file, { interval: 100 }, (prev, curr) ->
            if Number(new Date(prev.mtime)) != Number(new Date(curr.mtime))
              self.restartProcess(file.replace(/\.\//, ""))
    @startProcess()

  startProcess: ->
    self = this
    @process = spawn @launcher, @passedArguments,
      env: process.env

    @process.stdout.on "data", (data) ->
      util.print data.toString()
    @process.stderr.on "data", (data) ->
      self.stderrOutput data.toString(), false
    
    @output "#{@launcher} process restarted", true
    @growl "#{@launcher} process restarted", "Hot#{@launcher}"

  restartProcess: (filename) ->
    if @process?
      try
        @process.kill("SIGKILL")
      catch e
        @output "Exception: #{e.message}", false
    @output "#{filename} changed", false
    @startProcess()

