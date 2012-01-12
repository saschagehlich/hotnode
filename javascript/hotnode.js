#!/usr/bin/env node
var HotLoader, VERSION, args, loader, path;
path = require('path');
HotLoader = require('./hotloader').HotLoader;
VERSION = "0.0.6";
args = process.argv;
if (args.length > 2) {
  if (args[2] === "-v" || args[2] === "--version") {
    console.log("v" + VERSION);
  } else {
    loader = new HotLoader(args, "js", "node");
    loader.run();
  }
} else {
  console.log("\nHotnode - Hot code loading for Node.js\n");
  console.log("Usage:");
  console.log("   hotnode [options] script.js [arguments] ");
  console.log("Hotnode arguments:")
  console.log(" -t=[EXTENSION]          Watch .{EXTENSION} files instead of .js")
  console.log(" -l=[LAUNCHER]           Run app with LAUNCHER instead of node")
  console.log("\nAll arguments of the node command can be used for hotnode as well.\n");
}