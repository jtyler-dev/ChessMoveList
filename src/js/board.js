// repersentation of a chess board object in js
"use strict";
var mcUtility = require('./moveCalculationUtility');

var board = (function () {
    // default board set up using modified FEN notation
    // lowercase are black, uppercase are white
    // FEN format : board position from white perspective, whos turn it is
    var defaultBoard = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w';
    var board = null;
    var turn = 'w'; // default starting side
    var MAX_SQ = 8;

    // create and initalize chess board
    var createBoard = function(FENStr) {
        if (!board) {
            board = new Array(MAX_SQ);
            for(var i = 0; i < MAX_SQ; i++) {
                board[i] = new Array(MAX_SQ);
                for(var j = 0; j < MAX_SQ; j++) {
                    board[i][j] = {};
                }
            }
            // no fen provided, load default board
            if (!FENStr) {
                loadFen(defaultBoard);
            } else {
                loadFen(FENStr);
            }
        }
    };

    // helper method used to see the board repersentation
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

        return {'isValid': isValid, 'errString': errString};
    };

    // takes a fen string, processess it, and loads it
    var loadFen = function (fen) {
        var tokens = fen.split(/\s+/);
        var pieces = tokens[0].split('/');
        turn = tokens[1];

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

    //gets the piece at the given position of the board
    var getPiece = function(row, col) {
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

    // creates more meaningful output for the user to read about the valid moves
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

    // calculates the valid moves on the board
    var caluclateValidMoves = function() {
        var allMoves = [];
        for(var row = 0; row < MAX_SQ; row++) {
            for(var col = 0; col < MAX_SQ; col++){
                var pieceLoc = getPiece(row, col);
                var piece = pieceLoc.piece ? pieceLoc.piece : null;

                if(piece && piece.color === turn) {
                    var validMoves = mcUtility.getValidMovesForPiece(this, turn, pieceLoc);
                    allMoves.push(validMoves);
                }
            }
        }

        return allMoves;
    };

    // calculates the valid moves for the turn on the board,
    // returns everything in human reable output
    var caluclateValidMovesHR = function(){
        var allMoves = this.caluclateValidMoves();
        var moveList = this.humanReadableOutput(allMoves);

        return moveList;
    };

    // returns the current turn
    var currentTurn = function() {
        return turn === 'w' ? 'white' : 'black';
    };

    return {
        createBoard: createBoard,
        printBoard: printBoard,
        getPiece: getPiece,
        loadFen: loadFen,
        validateFEN: validateFEN,
        clearBoard: clearBoard,
        caluclateValidMoves: caluclateValidMoves,
        mapBoardPosition: mapBoardPosition,
        caluclateValidMovesHR: caluclateValidMovesHR,
        humanReadableOutput:humanReadableOutput,
        currentTurn:currentTurn
    };
});

module.exports = board;
