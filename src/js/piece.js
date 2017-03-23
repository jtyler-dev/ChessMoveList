"use strict";

var movementCalc = require('./pieceMovementCalculator');

var piece = function(boardState, type, color, row, col){
    var that = this;
    this._color = color;
    this._position = {'row': row, 'col': col};
    this._type = type;
    this._board = boardState;

    this.getColor = function () {
        return that._color;
    };

    this.getType = function() {
        return that._type;
    };

    this.getPosition = function() {
        return that._position;
    };

    this.getMoves = function(){
        var validMoves = [];
        switch (that._type) {
            case 'p':
                validMoves = movementCalc.movePawn(that);
                break;
            case 'r':
                validMoves = movementCalc.moveRook(that);
                break;
            case 'n':
                validMoves = movementCalc.moveKnight(that);
                break;
            case 'b':
                validMoves = movementCalc.moveBishop(that);
                break;
            case 'q':
                validMoves = movementCalc.moveQueen(that);
                break;
            case 'k':
                validMoves = movementCalc.moveKing(that);
                break;
            default:
                break;
        };

        return {
            'piece' : that,
            'validMoves' : validMoves
        };
    };
};

module.exports = piece;
