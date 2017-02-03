"use strict";
var $ = require('jQuery');
var board = require('./board');

var chessMoveCalculator = (function () {
    var chessBoard;

    var init = function() {
        chessBoard = new board();
        chessBoard.createBoard();
        chessBoard.printBoard();

        initDisplay();
    };

    var initDisplay = function() {
        $('#fenSubmit').click(fenInput);
    };

    var fenInput = function(){
        var resultsDiv = $('#valid-move-display');
        var fenStr = $('#fenStr').val();
        var validMoves;
        resultsDiv.html('');
        chessBoard.clearBoard();
        chessBoard.loadFen(fenStr);
        chessBoard.printBoard();
        validMoves = chessBoard.caluclateValidMovesHR();
        console.log(validMoves);

        for(var i = 0; i < validMoves.length; i++){
            resultsDiv.append('<div>' + validMoves[i] + '</div>');
        }


    };

    return {init:init};
})();

module.exports = chessMoveCalculator;

$(document).ready(function() {
    chessMoveCalculator.init();
});
