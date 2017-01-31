"use strict";
var path = require("path");
var SRC_DIR = path.resolve(__dirname, "src");
var DIST_DIR = path.resolve(__dirname, "dist");

module.exports = {
    entry: SRC_DIR + "/js/chessMoveCalculator.js",
    output: {
        path: DIST_DIR ,
        filename: "app.js"
    },
    devServer: {
        inline: true,
        port: 8080
    }
};
