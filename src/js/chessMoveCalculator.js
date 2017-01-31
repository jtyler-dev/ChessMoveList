"use strict";
var board = require('./board');
var mcUtility = require('./moveCalculationUtility');

var chessMoveCalculator = (function () {
    var chessBoard = new board();
    chessBoard.createBoard();
    chessBoard.printBoard();

    console.log(mcUtility.moveRook(chessBoard, 7,0));
})();

module.exports = chessMoveCalculator;
