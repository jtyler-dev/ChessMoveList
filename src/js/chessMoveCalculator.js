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
        var validFen = chessBoard.validateFEN(fenStr);

        resultsDiv.html('');
        if(validFen.isValid) {
            chessBoard.clearBoard();
            chessBoard.loadFen(fenStr);
            chessBoard.printBoard();
            validMoves = chessBoard.caluclateValidMovesHR();
            resultsDiv.append('<div>Current turn is : ' + chessBoard.currentTurn() + '</div>');

            for(var i = 0; i < validMoves.length; i++){
                resultsDiv.append('<div>' + validMoves[i] + '</div>');
            }
        } else {
            resultsDiv.append('<div>Given FEN string is not valid : ' + validFen.errString + '</div>');
        }

    };

    return {init:init};
})();

module.exports = chessMoveCalculator;

$(document).ready(function() {
    chessMoveCalculator.init();
});
