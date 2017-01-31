"use strict";

var moveCalculationUtility = (function (){

    // helper functions

    // checks to see if a given space is within the board limits
    var checkOnBoard = function(row, col) {
        return (row >= 0 && row < 8) && (col >= 0 && col < 8);
    };

    // checks to see if a space is empty
    var isEmpty = function(space) {
        return typeof space === 'undefined';
    };

    // checks to see if moving to a space

    // !!!!!!!!!!!!!!!!!!!!!!!
    //TODO: fix check to handle the case when you take a piece and then
    // stop moving in that direction for rook, bishop, queen

    var checkIfValidMove = function(space, row, col, turnColor) {
        return checkOnBoard(row, col) &&
               (isEmpty(space) || (!isEmpty(space) && space.color !== turnColor));
    };

    var checkMovesOfBoardWidePieces = function(board, movementCoords, piece) {
        var validMoves = [];
        var direction = (piece.color === 'w') ? -1 : 1;
        for(var step = 1; step < 8; step++) {
            for(var move = 0; move < movementCoords.length; move++) {
                var movement = movementCoords[move];
                var posX = (direction * movement.x * step) + row;
                var posY = (direction * movement.y * step) + col;

                if(checkIfValidMove(board.findPiece(posX, posY), posX, posY, piece.color)) {
                    validMoves.push({'row': posX,'col':posY});
                }
            }
        }
        return validMoves;
    };

    // caluclate pieces valid moves

    // caluclate valid moves for pawns
    var movePawn = function(board, row, col) {
        // get the piece on the board we are looking at
        var piece = board.findPiece(row, col);
        var validMoves = [];

        // check to see it is a valid pawn
        if(piece.piece === 'p') {
            var direction = (piece.color === 'w') ? -1 : 1;

            // if a pawn has not been moved from the stating position is can
            // move forward 2 spaces. The pawn may move only two spaces if the first space is empty.
            if((row === 1 && piece.color === 'b')  || (row === 6 && piece.color === 'w')) {
                // if the space infront of the pawn is clear and the space
                // 2 tiles ahead of the pawn is clear, moving 2 spaces from the starting
                // rank is valid
                if(isEmpty(board.findPiece(row + direction, col)) &&
                   isEmpty(board.findPiece(row + (2 * direction), col))) {
                    validMoves.push({'row': row + (2 * direction),'col':col});
                }
            }
            // pawn movement is unique since it only moves forward and can
            // only attack diagonal, so we have to do some special checking

            // pawn movement is 1 space infront of it
            var move = row + direction;
            // check if pawn can move 1 space infront of it
            if(checkOnBoard(move, col) && isEmpty(board.findPiece(move,col))) {
                validMoves.push({'row': move,'col':col});
            }

            // pawn can also more diagonal if it takes a piece
            // check it pawn can take piece that
            if(checkOnBoard(move, col + 1) &&
               !isEmpty(board.findPiece(move, col + 1)) &&
               board.findPiece(move, col + 1).color !== piece.color){
                validMoves.push({'row': move,'col':col+1});
            }

            if(checkOnBoard(move, col - 1) &&
               !isEmpty(board.findPiece(move, col - 1)) &&
               board.findPiece(move, col - 1).color !== piece.color){
                validMoves.push({'row': move,'col':col-1});
            }
        }

        return validMoves;
    };

    // caluclate valid moves for rooks
    // valid rook movement is up/down left/right as far as it wants
    var moveRook = function(board, row, col) {
        var piece = board.findPiece(row, col);
        var validMoves = [];
        // movementCoords repersent how the piece can move on in cartesian plane
        // if stop = true, then the piece cannot move in that direction anymove
        // ie: the selected piece has take an oppentents piece, or it hit the edge of the board
        var movementCoords = [{'x':0, 'y':1, 'stop': false},{'x':-1, 'y':0, 'stop': false},
                              {'x':1, 'y':0, 'stop': false},{'x':0, 'y':-1, 'stop': false}];

        if(piece.piece === 'r') {
            //validMoves = checkMovesOfBoardWidePieces(board, movementCoords, piece);
            var direction = (piece.color === 'w') ? -1 : 1;
            var movesLeft = movementCoords.length;

            //since rooks can move boardwide we have to check each direction
            for(var step = 1; step < 8; step++) {
                // check each movement as we start to move from the starting point
                for(var move = 0 ; move < movementCoords.length; move ++) {
                    var movement = movementCoords[move];
                    if(!movement.stop)
                    {
                        var posX = (direction * movement.x * step) + row;
                        var posY = (direction * movement.y * step) + col;

                        if(checkOnBoard(posX, posY))
                        {
                            // move within the boundries of the board
                            var space = board.findPiece(posX, posY);

                            if(isEmpty(space))
                            {
                                // space is empty, valid move
                                validMoves.push({'row': posX,'col':posY});

                            } else if (space.color !== piece.color) {
                                // the space is not empty and is occupied by an
                                // oppentents piece, taking it is a valid move
                                validMoves.push({'row': posX,'col':posY});
                                // piece stops moving after taking another piece
                                movement.stop = true;

                            } else {
                                //the space is occupied by another one players piece so we stop here
                                movement.stop = true;
                            }

                        } else {
                            // move is off the board, so we mark this direction as
                            // done so we dont keep checking it
                            movement.stop = true;
                        }

                        if(movement.stop) {
                            movesLeft--;
                        }
                    }
                }

                if(movesLeft <= 0) {
                    // no valid moves left, so we stop checking
                    break;
                }
            }
        }

        return validMoves;
    };

    // caluclate valid moves for knights
    var moveKnight = function(board, row, col) {
        var piece = board.findPiece(row, col);
        var validMoves = [];
        var movementCoords = [{'x':-1, 'y':2}, {'x':1, 'y':2}, {'x':-2, 'y':1},
                              {'x':2, 'y':1}, {'x':-2, 'y':-1}, {'x':2, 'y':-1},
                              {'x':-1, 'y':-2}, {'x':1, 'y':-2}];

        if(piece.piece === 'n') {
            var direction = (piece.color === 'w') ? -1 : 1;

            for(var i = 0; i < movementCoords.length;i++) {
                var position = movementCoords[i];

                var posX = (direction * position.x) + row;
                var posY = (direction * position.y) + col;

                if(checkIfValidMove(board.findPiece(posX, posY), posX, posY, piece.color)) {
                    validMoves.push({'row': posX,'col':posY});
                }
            }
        }

        return validMoves;
    };

    // caluclate valid moves for bishops
    var moveBishop = function(board, row, col) {
        var piece = board.findPiece(row, col);
        var validMoves;
        var movementCoords = [{'x':-1, 'y':1},,{'x':1, 'y':1},
                          {'x':-1, 'y':-1},{'x':1, 'y':-1}];

        if(piece.piece === 'b') {
            validMoves = checkMovesOfBoardWidePieces(board, movementCoords, piece);
        }

        return validMoves;
    };

    // caluclate valid moves for the queen
    var moveQueen = function(board, row, col) {
        var piece = board.findPiece(row, col);
        var validMoves;
        var movementCoords = [{'x':-1, 'y':1},{'x':0, 'y':1},{'x':1, 'y':1},
                              {'x':-1, 'y':0},{'x':1, 'y':0},
                              {'x':-1, 'y':-1},{'x':0, 'y':-1},{'x':1, 'y':-1}];

        if(piece.piece === 'q') {
            validMoves = checkMovesOfBoardWidePieces(board, movementCoords, piece);
        }

        return validMoves;
    };

    // caluclate valid moves for the king
    var moveKing = function(board, row, col) {
        var piece = board.findPiece(row, col);
        var validMoves = [];
        var movementCoords = [{'x':-1, 'y':1},{'x':0, 'y':1},{'x':1, 'y':1},
                              {'x':-1, 'y':0},{'x':1, 'y':0},{'x':-1, 'y':-1},
                              {'x':0, 'y':-1},{'x':1, 'y':-1}];

        if(piece.piece === 'k') {
            var direction = (piece.color === 'w') ? -1 : 1;
            for(var i = 0; i < movementCoords.length;i++) {
                var position = movementCoords[i];

                var posX = (direction * position.x) + row;
                var posY = (direction * position.y) + col;

                if(checkIfValidMove(board.findPiece(posX, posY), posX, posY, piece.color)) {
                    validMoves.push({'row': posX,'col':posY});
                }
            }
        }

        return validMoves;
    };

    return {
        movePawn: movePawn,
        moveRook: moveRook,
        moveKnight: moveKnight,
        moveBishop: moveBishop,
        moveQueen: moveQueen,
        moveKing: moveKing
    };

})();

module.exports = moveCalculationUtility;
