"use strict";
var BG = require('./boardGlobals');

// helper functions for the chess board
var chessBoardHelper = function(){
    var MAX_SQ = BG.MAX_SQ;

    // validates a fen string to make sure that it is in the correct format
    // for the app to process
    var validateFEN = function(fenStr) {
        var tokens = fenStr.split(/\s+/);
        var pieces = tokens[0].split('/');
        var turn = tokens[1];
        var isValid = true;
        var prevIsNum = false;
        var row, piece, rowSum;
        var errString = "";


        // check to see if basic format is there
        if(tokens.length < 2) {
            isValid = false;
            errString = "FEN string is not correctly formatted";
        }

        //check to see if we have the correct turn
        if(isValid && !(turn !== "w" || turn !== "b")) {
            errString = "FEN string contains invalid turn character"
            isValid = false;
        }

        // check to see if fen has the correct number of rows
        if(isValid && pieces.length === 8) {
            // check each row
            for(var i = 0; i < pieces.length; i ++) {
                row = pieces[i];
                rowSum = 0;

                // check each piece in the row
                for(var j = 0; j < row.length; j++) {
                    piece = row[j];
                    //check if character is a number or not
                    if(!isNaN(piece)){
                        // it is a number
                        //check if we have had 2 numbers in a row
                        if(prevIsNum) {
                            errString = "FEN string contains invalid Row : 2 numbers consecutively in a row";
                            isValid = false;
                            break;
                        }

                        rowSum += parseInt(piece);
                        prevIsNum = true;

                    } else if(/^[prnbqkPRNBQK]$/.test(piece)){
                        // regex expression to check if the character is within the valid set of
                        // characters
                        prevIsNum = false;
                        rowSum += 1;
                    } else {
                        // we have a character that is
                        errString = "FEN string contains invalid character";
                        isValid = false;
                        break;
                    }
                }

                prevIsNum = false;
                if(!isValid || rowSum != 8) {
                    break;
                }
            }
        } else if(isValid) {
            errString = "FEN string does not contain correct ammount of rows";
            isValid = false;
        }

        return {
            'isValid': isValid,
            'boardState' : {'pieces':pieces, 'turn': turn },
            'errString': errString
        };
    };

    // helper method to pring out the current state of the board
    var printBoard = function(boardObj) {
        var boardStr = "";
        var board = boardObj.getBoard();
        var currentTurn = boardObj.getCurrentTurn();

        for(var i = 0; i < MAX_SQ; i++) {
            for(var j = 0; j < MAX_SQ; j++) {
                var tile = board[i][j];
                if( tile === null) {
                    boardStr += " X ";
                } else {
                    var color  = tile.getColor();
                    var piece = tile.getType();
                    if(color === 'w') {
                        boardStr += " " + piece.toUpperCase() + " ";
                    } else {
                        boardStr += " " + piece + " ";
                    }
                }
            }
            boardStr += '\n';
        }
        console.log(currentTurn + "'s turn to move'");
        console.log(boardStr);
    };

    // helper function that returns the coords of the board
    // how most people read them
    var mapBoardPosition = function (row, col) {
        var colLetter = ['a','b','c','d','e','f','g','h'];
        var rowNum = ['8','7','6','5','4','3','2','1'];

        return colLetter[col] + rowNum[row];
    };

    // creates more meaningful output for the user to read about the valid moves
    var humanReadableOutput = function(moveList) {
        var moveDirection = ["", "diagonal down left ", "down ", "diagonal down right ",
                             "left ", "-", "right ", "diagonal up left ", "up ",
                             "diagonal up right "];

        var hrMoveList = [];
        for(var i = 0; i < moveList.length; i++) {
            var piece = moveList[i].piece;
            var pos = piece.getPosition();
            var validMoves = moveList[i].validMoves;

            for(var j = 0; j < validMoves.length; j++) {
                var move = validMoves[j];
                var movementLocStr = "";

                if(move.type === "interval") {
                    var moveStart = mapBoardPosition(move.moveStart.row, move.moveStart.col);
                    var moveEnd = mapBoardPosition(move.moveEnd.row, move.moveEnd.col);

                    movementLocStr = moveDirection[move.moveDir] + moveStart + " though " + moveEnd;

                } else {
                    movementLocStr = moveDirection[move.moveDir] + "to " + mapBoardPosition(move.row, move.col);

                }

                var moveStr = piece.getType() + " @ " + mapBoardPosition(pos.row, pos.col) + " " + movementLocStr ;
                hrMoveList.push(moveStr);
            }
        }

        return hrMoveList;
    };

    return {
        validateFEN : validateFEN,
        printBoard : printBoard,
        humanReadableOutput : humanReadableOutput
    };
}();

module.exports = chessBoardHelper;
