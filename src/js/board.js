// repersentation of a chess board object in js
"use strict";

// todo:
// implement FEN Notation https://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
// implement position mapping? IE, a1 b1 etc https://en.wikipedia.org/wiki/Algebraic_notation_(chess)
var mcUtility = require('./moveCalculationUtility');

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
                for(var j = 0; j < MAX_SQ; j++) {
                    board[i][j] = {};
                }
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
                if( Object.keys(tile).length === 0) {
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
        turn = tokens[1];
        // todo validation ?

        for(var i=0; i < pieces.length; i ++) {
            var rowPieces = pieces[i];
            var colLoc = 0;
            for(var j = 0; j < rowPieces.length; j++) {
                var piece = rowPieces.charAt(j);

                if(!isNaN(piece)) {
                    // skip the tiles that are empty
                    var blankTiles = parseInt(piece);
                    colLoc += (blankTiles);

                } else {
                    // insert the piece into correct place
                    var color = (piece < 'a') ? 'w' : 'b';
                    board[i][colLoc] = {'piece': piece.toLowerCase(), 'color': color};
                    colLoc++;
                }
            }
        }
    };

    var findPiece = function(row, col) {
        var piece;
        var retObj = {};
        if((row >= 0 && row < 8) && (col >= 0 && col < 8)) {
            piece = board[row][col];
            if (Object.keys(piece).length >0) {
                retObj = {'piece':board[row][col], 'location': {'row':row, 'col':col} };
            }
        }
        return retObj;
    };

    var clearBoard = function() {
        for(var i = 0; i < MAX_SQ; i++) {
            for(var j = 0; j < MAX_SQ; j++) {
                board[i][j] = {};
            }
        }
    };

    // helper function that returns the coords of the board
    // how most people read them
    var mapBoardPosition = function (row, col) {
        var colLetter = ['a','b','c','d','e','f','g','h'];
        var rowNum = ['8','7','6','5','4','3','2','1'];

        return colLetter[col] + rowNum[row];
    };

    var humanReadableOutput = function(movesList) {
        var moveDirection = ["", "diagonal down left ", "down ", "diagonal down right ",
                             "left ", "-", "right ", "diagonal up left ", "up ",
                             "diagonal up right "];
        var moveList = [];
        for(var i = 0; i < movesList.length; i++) {
            var moveSet = movesList[i];

            for(var j = 0; j < moveSet.length; j++) {
                var moveInfo = moveSet[j];
                var pieceType = moveInfo.piece;
                var pieceLocation = moveInfo.pieceLoc;

                var movementLocStr = "";

                if(moveInfo.moveStart) {
                    var moveStart = mapBoardPosition(moveInfo.moveStart.location.row, moveInfo.moveStart.location.col);
                    var moveEnd = mapBoardPosition(moveInfo.moveEnd.location.row,moveInfo.moveEnd.location.col);

                    movementLocStr = moveDirection[moveInfo.moveDir] + moveStart + " though " + moveEnd;
                } else {
                    movementLocStr = moveDirection[moveInfo.moveDir] + "to " + mapBoardPosition(moveInfo.moveLoc.row, moveInfo.moveLoc.col);
                }


                var moveStr = pieceType + " @ " + mapBoardPosition(pieceLocation.row, pieceLocation.col) + " " + movementLocStr ;
                moveList.push(moveStr);
            }
        }

        return moveList;
    };

    var caluclateValidMoves = function() {
        var allMoves = [];
        for(var row = 0; row < MAX_SQ; row++) {
            for(var col = 0; col < MAX_SQ; col++){
                var pieceLoc = findPiece(row, col);
                var piece = pieceLoc.piece ? pieceLoc.piece : null;

                if(piece && piece.color === turn) {
                    var validMoves = mcUtility.getValidMovesForPiece(this, turn, pieceLoc);
                    allMoves.push(validMoves);
                }
            }
        }

        return allMoves;
    };

    var caluclateValidMovesHR = function(){
        var allMoves = this.caluclateValidMoves();
        var moveList = this.humanReadableOutput(allMoves);

        return moveList;
    };

    return {
        createBoard: createBoard,
        printBoard: printBoard,
        findPiece: findPiece,
        loadFen: loadFen,
        clearBoard: clearBoard,
        caluclateValidMoves: caluclateValidMoves,
        mapBoardPosition: mapBoardPosition,
        caluclateValidMovesHR: caluclateValidMovesHR,
        humanReadableOutput:humanReadableOutput
    };
});

module.exports = board;
