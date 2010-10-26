exec = require('child_process').exec
spawn = require('child_process').spawn
fs = require('fs')

exports.HotLoader = class
  constructor: (args) ->
    @args = args
  
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
    exec "growlnotify -m \"#{message}\" -t \"#{title}\" --image #{__dirname}/nodejs.png"
  
  # File watching functions
  run: ->  
    extName = if match = @args[@args.length - 1].match(/^-t=(.*)/) then match[1] else "js"
    
    self = this
    watch = exec "find . -name \"*.#{extName}\""
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
    @process = spawn "node", @args.slice(2), 
      env: process.env
      
    @process.stdout.on "data", (data) ->
      console.log data.toString()
    @process.stderr.on "data", (data) ->
      self.stderrOutput data.toString(), false
    
    @output "Node.js process restarted", true
    @growl "Node.js process restarted", "Hotnode"
  
  restartProcess: (filename) ->
    if @process?
      try
        @process.kill("SIGKILL")
      catch e
        @output "Exception: #{e.message}", false
    @output "#{filename} changed", false
    @startProcess()