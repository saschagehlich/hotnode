exec = require('child_process').exec
fs = require('fs')
path = require('path')

# Node.js hot loading
HotLoader = class
  command: ""
  process: null
  constructor: (command) ->
    @command = command
    @files = {}
    @changedFile = "No files"
    
  run: ->
    self = this
    # start watching files
    watch = exec "find . -name \"*.js\""
    watch.stdout.on "data", (data) ->
      files = data.split "\n"
      for file in files
        if file
          fileStat = fs.statSync file
          self.files[fileStat.ino] = file
        fs.watchFile file, { interval: 100 }, (prev, curr) ->
          prevMtime = Number(new Date(prev.mtime))
          currMtime = Number(new Date(curr.mtime))
          
          if prevMtime != currMtime
            file = self.files[curr.ino]
            self.changedFile = file.replace /\.\//, ""
            self.restartProcess()
    
    @startProcess()
    
  startProcess: ->
    @process = exec @command
    @process.stdout.on "data", (data) ->
      console.log data
    @process.stderr.on "data", (data) ->
      console.log "\033[1;30m=== \033[1;31m#{data}\033[m"
    
    console.log "\033[1;30m=== \033[1;32mNode.js process restarted\033[m"
    
  restartProcess: ->
    if @process?
      try
        @process.kill("SIGKILL")
      catch e
        console.log "\033[1;30m=== \033[1;31mException: #{e.message}\033[m"
    console.log "\033[1;30m=== \033[1;31m#{@changedFile} changed\033[m"
    @startProcess()
    exec "growlnotify -m \"#{@changedFile} changed\" -t \"Node.js restarted\" --image ./nodejs.png"


args = process.argv
if args.length > 2
  file = args[2]
  path.exists file, (exists) ->
    if exists
      command = "node ./#{file}"
      loader = new HotLoader(command)
      loader.run(command)
    else
      console.log "\033[1;31m#{file} does not exist!\033[m"
else
  console.log "\033[1;31mNo file given!\033[m"
  console.log "Usage:"
  console.log "   hotnode <file>"