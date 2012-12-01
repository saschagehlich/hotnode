exec = require('child_process').exec
spawn = require('child_process').spawn
fs = require('fs')
util = require('util')
watch = require('watch')

exports.HotLoader = class
  constructor: (args, @extName, @launcher) ->
    @args = args
    @passedArguments = @args.slice 2
    
    # Argument handling
    extOptions = @args.filter (arg) ->
      arg.match /^-t=(.*)$/
    launcherOptions = @args.filter (arg) ->
      arg.match /^-l=(.*)$/

    # check for "-t" argument (type)
    if extOptions.length > 0 and match = extOptions[extOptions.length-1].match /^-t=(.*)/
      @extName = match[1]

      for arg, i in @passedArguments when arg is "-t=#{match[1]}"
        @passedArguments.splice i, 1

    # check for "-l" argument (launcher)
    if launcherOptions.length > 0 and match = launcherOptions[launcherOptions.length-1].match /^-l=(.*)/
      @launcher = match[1]

      for arg, i in @passedArguments when arg is "-l=#{match[1]}"
        @passedArguments.splice i, 1

  # Output functions
  output: (message, type) ->
    
    switch type
      when "good"
        textcolor = "32m"
        prefixcolor = "42m"
      when "bad"
        textcolor = "31m"
        prefixcolor = "41m"
      when "info"
        textcolor = "35m"
        prefixcolor = "45m"

    output = "\u001b[0;#{prefixcolor}    hotnode \u001b[m \u001b[0;#{textcolor}#{message}\u001b[m"

    console.log output

  stderrOutput: (message) ->
    output = "\u001b[0;31m#{message}\u001b[m"
    console.log output

  growl: (message, title) ->
    if process.env.DESKTOP_SESSION and ~process.env.DESKTOP_SESSION.indexOf("gnome")
      exec "notify-send --hint=int:transient:1 --icon #{__dirname}/nodejs.png \"#{title}\" \"#{message}\" "
    else
      exec "growlnotify -m \"#{message}\" -t \"#{title}\" --image #{__dirname}/nodejs.png"

  # File watching functions
  run: ->
    watch.watchTree './', (f, curr, prev) =>
      regex = "\.#{@extName}$"
      if RegExp(regex).test f
        if typeof f is "object" and prev is null and curr is null
          # finished walking trees... maybe we need this later?
        else if prev is null
          @output "New file: #{f}", "info"
          @restartProcess()
        else if curr.nlink is 0
          @output "#{f} has been deleted", "info"
          @restartProcess()
        else
          @output "#{f} has been changed", "info"
          @restartProcess()
    
    @startProcess()

  startProcess: ->
    @process = spawn @launcher, @passedArguments,
      env: process.env

    @process.stdout.on "data", (data) =>
      util.print data.toString()
    @process.stderr.on "data", (data) =>
      @stderrOutput data.toString()
    
    @output "#{@launcher} process restarted", "good"
    @growl "#{@launcher} process restarted", "Hot#{@launcher}"

  restartProcess: ->
    if @process?
      try
        @process.kill("SIGKILL")
      catch e
        @output "Exception: #{e.message}", "bad"
    @startProcess()

