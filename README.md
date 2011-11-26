Hotnode
=======

Hotnode is a package that allows you to automatically reload your code by just saving the source in your editor.

Feature Overview
-----------------

* Automatically reloads your node.js code on file change
* Watches .js files in the current directory and its subdirectories

Installation
============

The following versions are required for Hotnode:

* Node.js >= 0.2.2
* npm >= 0.1.25

To see growl messages as soon as your node.js process has been restarted, you will need [http://growl.info/extras.php#growlnotify](growlnotify), a command-line based tool for growl.

For notifications on Ubuntu / Gnome, you need libnotify:

    sudo apt-get install libnotify-bin

Install it simply via npm:

    npm install hotnode

Instructions
============

Instead of starting your app directly with
    node app.js
Launch it with
    hotnode app.js


Hotcoffee
=========

Hotnode also includes an executable called `hotcoffee` which automatically runs the given file with the `coffee` command and watches all CoffeeScript files in the directory.

License
=======

Copyright (c) 2010 [http://www.filshmedia.net](FILSH Media GmbH), released under the MIT license

