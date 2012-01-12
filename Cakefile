util = require 'util'
fs = require 'fs'
exec = require('child_process').exec
spawn = require('child_process').spawn

LEVELS =
  whitespace: 'WHITESPACE_ONLY'
  simple: 'SIMPLE_OPTIMIZATIONS'
  advanced: 'ADVANCED_OPTIMIZATIONS'

task 'watch', 'watches and compiles coffee', ->
  util.print "Spawning coffee watcher for node"
  coffee = spawn 'coffee', ['-cwl', '--bare', '-o', 'javascript', 'coffeescript']
  util.print ""
  
  [coffee].forEach (child) ->
      child.stdout.on 'data', (data) -> 
        util.print data
        exec "growlnotify -m \"#{data}\" -t \"Cakefile\""
      child.stderr.on 'data'  , (data) -> 
          util.print data
          exec "growlnotify -m \"#{data}\" -t \"Cakefile\""