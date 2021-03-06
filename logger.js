"use strict"

let async = require("async");
let readpump = require("./readpump.js");
let writepump = require("./writepump.js");
let toml = require("toml");

let config = loadConfig();

// start output handles
let wp = new writepump(config.output);
wp.Run();

// get a readpump
var rp = new readpump(config.input, config.measurements, wp);

async.forever(
	function(forever_next) {
		rp.Run(function(err) {
			console.log("An error occured in the Readpump:", err)
			let wait = config.failoverTimeout || 5000;
			console.log("Restarting readpump in", wait, "seconds.")
			setTimeout(forever_next, wait)
		});
	},
	function(err) {
		console.log("Restarting readpump...")
	}
);

function loadConfig() {
	var path = require("path").resolve(__dirname, 'config.toml');
	var text = require("fs").readFileSync(path, "utf8");
	return toml.parse(text);
}
