"use strict";
var $ = require('jQuery');
var chessBoard = require('./chessBoard');
var BG = require('./boardGlobals');
var CBH = require('./chessBoardHelper');


var chessMoveCalculator = function() {
    var board = null;
    var init = function() {
        board = new chessBoard();
        board.createBoard();
        //board.loadFen(BG.DEFAULT_BOARD);
        //board.getValidMoves();

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

        var fenCheck = board.loadFen(fenStr);

        if(fenCheck.errString) {
            resultsDiv.append('<div>Given FEN string is not valid : ' + fenCheck.errString + '</div>');
        } else {
            validMoves = board.caluclateValidMovesHR();
            resultsDiv.append('<div>Current turn is : ' + board.getCurrentTurn() + '</div>');
            for(var i = 0; i < validMoves.length; i++){
                resultsDiv.append('<div>' + validMoves[i] + '</div>');
            }
        }
    };


    return {
        init: init
    };
}();

module.exports = chessMoveCalculator;

$(document).ready(function() {
    chessMoveCalculator.init();
});
