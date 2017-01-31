// repersentation of a chess board object in js
"use strict";

// todo:
// implement FEN Notation https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
// implement position mapping? IE, a1 b1 etc https://en.wikipedia.org/wiki/Algebraic_notation_(chess)

var board = (function () {
    // default board set up using modified FEN notation
    // lowercase are black, uppercase are white
    // FEN format : board position from white perspective, whos turn it is
    var defaultBoard = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w';
    var board = null;
    var turn = 'w'; // default starting side
    var MAX_SQ = 8;

    var createBoard = function(FENStr) {
        if (!board) {
            board = new Array(MAX_SQ);
            for(var i = 0; i < MAX_SQ; i++) {
                board[i] = new Array(MAX_SQ);
            }

            if (!FENStr) {
                loadFen(defaultBoard);
            } else {
                loadFen(FENStr);
            }
        }
    };

    var printBoard = function() {
        var boardStr = "";

        for(var i = 0; i < MAX_SQ; i++) {
            for(var j = 0; j < MAX_SQ; j++) {
                var tile = board[i][j];
                if( tile == null) {
                    boardStr += " X ";
                } else {
                    var piece = tile.piece;
                    if(tile.color === 'w') {

                        boardStr += " " + piece.toUpperCase() + " ";
                    } else {
                        boardStr += " " + piece + " ";
                    }
                }
            }
            boardStr += '\n';
        }
        console.log(turn  + "'s turn to move'");
        console.log(boardStr);
    };

    var loadFen = function (fen) {
        var tokens = fen.split(/\s+/);
        var pieces = tokens[0].split('/');
        var turn = tokens[1];
        // todo validation ?

        for(var i=0; i < pieces.length; i ++) {
            var rowPieces = pieces[i];

            for(var j = 0; j < rowPieces.length; j++) {
                var piece = rowPieces.charAt(j);

                if(!isNaN(piece)) {
                    // skip the tiles that are empty
                    var blankTiles = parseInt(piece);
                    j += blankTiles;

                } else {
                    // insert the piece into correct place
                    var color = (piece < 'a') ? 'w' : 'b';
                    board[i][j] = {'piece': piece.toLowerCase(), 'color': color};
                }
            }
        }
    };



    var findPiece = function(row, col) {
        if((row >= 0 && row < 8) && (col >= 0 && col < 8)) {
            return board[row][col];
        }
        return -1;
    };

    var clearBoard = function() {};

    return {
        createBoard: createBoard,
        printBoard: printBoard,
        findPiece: findPiece
    };

});

module.exports = board;
