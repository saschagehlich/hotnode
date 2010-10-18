sys = require 'sys'
fs = require 'fs'
exec = require('child_process').exec
spawn = require('child_process').spawn

LEVELS =
  whitespace: 'WHITESPACE_ONLY'
  simple: 'SIMPLE_OPTIMIZATIONS'
  advanced: 'ADVANCED_OPTIMIZATIONS'

task 'watch', 'watches and compiles coffee', ->
  puts "Spawning coffee watcher for node"
  coffee = spawn 'coffee', ['-cwl', '--no-wrap', '-o', './', './']
  puts ""
  
  [coffee].forEach (child) ->
      child.stdout.on 'data', (data) -> 
        sys.print data
        exec "growlnotify -m \"#{data}\" -t \"Cakefile\""
      child.stderr.on 'data'  , (data) -> 
          sys.print data
          exec "growlnotify -m \"#{data}\" -t \"Cakefile\""