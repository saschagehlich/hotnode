path = require('path')
HotLoader = require('./hotloader').HotLoader

VERSION = "0.0.2"

args = process.argv
if args.length > 2
    if args[2] is "-v" or args[2] is "--version"
      console.log "v#{VERSION}"
    else
      loader = new HotLoader(args)
      loader.run()
else
  console.log "\nHotnode - Hot code loading for Node.js\n"
  console.log "Usage:"
  console.log "   hotnode [options] script.js [arguments] "
  console.log "\nAll arguments of the node command can be used for hotnode as well.\n"