"use strict";
var BG = require('./boardGlobals');
var cbHelper = require('./chessBoardHelper');
var Piece = require('./piece');

var chessBoard = function(){
    var that = this;
    // the current state of the game stored here
    this.board = null;
    // default the currentTurn to be white, as per chess rules
    this.currentTurn = 'w';

    var createBoard = function() {
        if(!this.board) {
            this.board = new Array(BG.MAX_SQ);
            for(var i = 0; i < BG.MAX_SQ; i++) {
                this.board[i] = new Array(BG.MAX_SQ);
                for(var j = 0; j < BG.MAX_SQ; j++) {
                    this.board[i][j] = null;
                }
            }
        }
    };

    var clearBoard = function() {
        for(var i = 0; i < BG.MAX_SQ; i++) {
            for(var j = 0; j < BG.MAX_SQ; j++) {
                this.board[i][j] = null;
            }
        }
    };

    var loadFen = function (fen) {
        var fenValid = cbHelper.validateFEN(fen);
        var ret = {};
        if(fenValid.isValid) {
            this.clearBoard();
            var pieces = fenValid.boardState.pieces;
            var turn = fenValid.boardState.turn;
            this.currentTurn = turn;

            for(var i = 0; i < pieces.length; i++) {
                var rowPieces = pieces[i];
                var colLoc = 0;

                for(var j = 0; j < rowPieces.length; j++) {
                    var piece = rowPieces.charAt(j);

                    if(!isNaN(piece)) {
                        // skip the tiles that are empty
                        var blankTiles = parseInt(piece);
                        colLoc += (blankTiles);

                    } else {
                        var color = (piece < 'a') ? 'w' : 'b';
                        var newPiece = new Piece(this, piece.toLowerCase(), color, i, colLoc);
                        this.board[i][colLoc] = newPiece;
                        colLoc++;
                    }
                }
            }

        } else {
            ret = {
                'errString': fenValid.errString
            };
        }

        return ret;
    };

    var getValidMoves = function() {
        var validMoves = [];
        for(var i = 0; i < BG.MAX_SQ; i++) {
            for(var j = 0; j < BG.MAX_SQ; j++) {
                var tile = this.board[i][j];

                if(tile !== null && tile.getColor() === this.currentTurn) {
                    var moves = tile.getMoves();
                    if(moves.validMoves.length > 0) {
                        validMoves.push(moves);
                    }
                }
            }
        }

        return validMoves;
    };

    var getCurrentTurn = function(){
        return this.currentTurn;
    };

    var getBoard = function() {
        return this.board;
    }

    var checkOnBoard = function(row, col) {
        return (row >= 0 && row < BG.MAX_SQ) && (col >= 0 && col < BG.MAX_SQ);
    }

    var isSpaceEmpty = function(row, col) {
        return checkOnBoard(row, col) && this.board[row][col] === null;
    }

    var getSpace = function(row, col) {
        if(checkOnBoard(row,col)) {
            return this.board[row][col];
        } else {
            // return error status
            return -1;
        }
    };

    var caluclateValidMovesHR = function() {
        var moveList = this.getValidMoves();
        return cbHelper.humanReadableOutput(moveList);
    };

    return {
        createBoard : createBoard,
        clearBoard : clearBoard,
        loadFen : loadFen,
        getCurrentTurn : getCurrentTurn,
        getBoard : getBoard,
        getValidMoves : getValidMoves,
        isSpaceEmpty : isSpaceEmpty,
        getSpace : getSpace,
        checkOnBoard : checkOnBoard,
        caluclateValidMovesHR : caluclateValidMovesHR
    };

};

module.exports = chessBoard;
