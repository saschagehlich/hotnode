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
    loader = new HotLoader(args, "coffee", "coffee");
    loader.run();
  }
} else {
  console.log("\nHotcoffee - Hot code loading for Node.js running with CoffeeScript\n");
  console.log("Usage:");
  console.log("   hotcoffee [options] script.coffee [arguments] ");
  console.log("Hotnode arguments:")
  console.log(" -t=[EXTENSION]          Watch .{EXTENSION} files instead of .coffee")
  console.log(" -l=[LAUNCHER]           Run app with LAUNCHER instead of coffee")
  console.log("\nAll arguments of the coffee command can be used for hotcoffee as well.\n");
}