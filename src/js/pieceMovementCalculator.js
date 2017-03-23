"use strict";
var BG = require('./boardGlobals');

var pieceMovementCalculator = function (){

    var moveObj = function(moveDir, row, col) {
        return {
            'moveDir' : moveDir,
            'row' : row,
            'col' : col,
            'type' : 'obj'
        };
    }

    var moveInterval = function(moveDir, startRow, startCol, endRow, endCol) {
        return{
            'type' : 'interval',
            'moveDir': moveDir,
            'moveStart': {'row': startRow , 'col': startCol},
            'moveEnd': {'row': endRow , 'col': endCol }
        };
    };

    // detemines the human readable direction for a valid move
    var determineMoveDirection = function(rowDir, colDir) {
        // based off of numPad directions
        var dirStr = {"key-11": 1, "key-10": 2, "key-1-1": 3, "key01": 4,
                      "key0-1": 6, "key11": 7, "key10": 8, "key1-1": 9};
        var keyStr = "key" + rowDir + colDir;

        return dirStr[keyStr];
    };

    var checkMovesOfBoardWidePieces = function(piece, movementCoords) {
        var direction = (piece.getColor() === BG.WHITE) ? -1 : 1;
        var pos = piece.getPosition();
        var color = piece.getColor();
        var board = piece._board;
        var moveDir = 0;
        var validMoves = [];

        for(var i = 0; i < movementCoords.length; i++) {
            var movement = movementCoords[i];

            // since this a piece that can move board wide, we are only going to
            // record the start and the end of its movement and the direction
            var moveStart = null;
            var moveEnd = null;
            var continueMoving = true;
            var pieceMove = null;

            for(var step = 1; step < BG.MAX_SQ; step++) {
                var posX = (direction * movement.x * step) + pos.row;
                var posY = (direction * movement.y * step) + pos.col;

                if(board.checkOnBoard(posX, posY)) {
                    // moving in this direction is valid,
                    // determine what direction we are moving
                    if(step === 1) {
                        moveDir = determineMoveDirection(pos.row - posX, pos.col - posY);
                    }

                    var space = board.getSpace(posX, posY);

                    if(board.isSpaceEmpty(posX, posY)) {
                        // if this is the first step, set first validMove to this one
                        if(moveStart === null) {
                            moveStart = {"row": posX, "col": posY};
                        } else {
                            // else set lastMove to this
                            moveEnd = {"row": posX, "col": posY};
                        }
                    } else if(space !== -1 && space.getColor() !== color) {
                        // else if space is not empty and is oppentents piece,
                        // set first and last move to this step, break since we cant move any more
                        if(moveStart === null) {
                            moveStart = {"row": posX, "col": posY};
                            moveEnd = {"row": posX, "col": posY};

                        } else {
                            // else set lastMove to this
                            moveEnd = {"row": posX, "col": posY};
                        }

                        //create move stat record object here
                        pieceMove = moveInterval(moveDir, moveStart.row, moveStart.col, moveEnd.row, moveEnd.col);

                        // set this to false since we done moving this direction
                        continueMoving = false;
                    } else {
                        // else space is not empty and is friendly piece so we cannot move

                        // case where we move one space then the next step puts a friendly piece in
                        // font of us so we have a moveStart, but no moveEnd and just
                        // set moveEnd be moveStart
                        if(moveStart !== null && moveEnd === null) {
                            moveEnd = moveStart;
                        }

                        if(moveStart !== null && moveEnd !== null) {
                            pieceMove = moveInterval(moveDir, moveStart.row, moveStart.col, moveEnd.row, moveEnd.col);
                        }
                        // set this to false since we done moving this direction
                        continueMoving = false;
                    }

                    if(!continueMoving) {
                        // push record to valid moves
                        if(pieceMove !== null) {
                            validMoves.push(pieceMove);
                        }

                        // break since we are done moving this direction
                        break;
                    }

                } else {
                    // continuing to move in this direction will just
                    // keep being off board, so break and move on
                    break;
                }
            }
        }

        return validMoves;

    };

    var checkPieceMoves = function(piece, movementCoords, needMovementDir) {
        var validMoves = [];

        var direction = (piece.getColor() === BG.WHITE) ? -1 : 1;
        var pos = piece.getPosition();
        var color = piece.getColor();
        var board = piece._board;

        for(var i = 0; i < movementCoords.length;i++) {
            var movement = movementCoords[i];

            var posX = (direction * movement.x ) + pos.row;
            var posY = (direction * movement.y ) + pos.col;

            if(board.checkOnBoard(posX, posY)) {
                var moveDir = needMovementDir ? determineMoveDirection(pos.row - posX, pos.col - posY) : 0;

                var space = board.getSpace(posX, posY);
                if(board.isSpaceEmpty(posX, posY) || (space!== -1 && (space.getColor() !== color))) {
                    validMoves.push(moveObj(moveDir, posX, posY));
                }
            }
        }

        return validMoves
    };

    // caluclate pieces valid moves
    // caluclate valid moves for pawns
    var movePawn = function(piece) {
        var validMoves = [];
        var direction = (piece.getColor() === BG.WHITE) ? -1 : 1;
        var pos = piece.getPosition();
        var color = piece.getColor();
        var board = piece._board;

        //check to see if valid pawn
        if(piece.getType() === 'p') {

            // if a pawn has not been moved from the stating position is can
            // move forward 2 spaces. The pawn may move only two spaces if the first space is empty.
            if((pos.row === BG.blackStartingRow && color === BG.BLACK) || (pos.row === BG.whiteStartingRow && color === BG.WHITE)) {
                // if the space infront of the pawn is clear and the space
                // 2 tiles ahead of the pawn is clear, moving 2 spaces from the starting
                // rank is valid
                if(board.isSpaceEmpty((pos.row + direction), pos.col) && board.isSpaceEmpty((pos.row + (2 * direction)), pos.col)) {
                    validMoves.push(moveObj(((direction > 0) ? 2 : 8), (pos.row + (2 * direction)), pos.col));
                }
            }

            // pawn movement is unique since it only moves forward and can
            // only attack diagonal, so we have to do some special checking

            // pawn movement is 1 space infront of it
            var move = pos.row + direction;
            if(board.isSpaceEmpty(move, pos.col)) {
                validMoves.push(moveObj(((direction > 0) ? 2 : 8), move, pos.col));
            }

            // pawn can also more diagonal if it takes a piece
            // check it pawn can take piece that

            var diagonalSpace1 = board.getSpace(move, pos.col + 1);
            var diagonalSpace2 = board.getSpace(move, pos.col - 1);

            // if its not -1 it means we have a piece on that location
            if(diagonalSpace1 !== null && diagonalSpace1 != -1  && diagonalSpace1.getColor() !== color) {
                var takenSpace1 = diagonalSpace1.getPosition();
                validMoves.push(moveObj(((direction > 0) ? 3 : 9), takenSpace1.row, takenSpace1.col));
            }

            if(diagonalSpace2 !== null && diagonalSpace2 != -1  && diagonalSpace2.getColor() !== color) {
                var takenSpace2 = diagonalSpace2.getPosition();
                validMoves.push(moveObj(((direction > 0) ? 1 : 7), takenSpace2.row, takenSpace2.col));
            }
        }

        return validMoves;
    };

    // caluclate valid moves for rooks
    // valid rook movement is up/down left/right as far as it wants
    var moveRook = function(piece) {
        var validMoves = [];
        // movementCoords repersent how the piece can move on in cartesian plane
        var movementCoords = [{'x':0, 'y':1},{'x':-1, 'y':0},
                              {'x':1, 'y':0},{'x':0, 'y':-1}];

        if(piece.getType() === 'r') {
            validMoves = checkMovesOfBoardWidePieces(piece, movementCoords);
        }

        return validMoves;
    };

    // caluclate valid moves for knights
    var moveKnight = function(piece) {
        var validMoves = [];
        var movementCoords = [{'x':-1, 'y':2}, {'x':1, 'y':2}, {'x':-2, 'y':1},
                              {'x':2, 'y':1}, {'x':-2, 'y':-1}, {'x':2, 'y':-1},
                              {'x':-1, 'y':-2}, {'x':1, 'y':-2}];

        if(piece.getType() === 'n') {
            validMoves = checkPieceMoves(piece, movementCoords, false);
        }

        return validMoves;
    };

    // caluclate valid moves for bishops
    var moveBishop = function(piece) {
        var validMoves = [];
        var movementCoords = [{'x':-1, 'y':1},{'x':1, 'y':1},
                          {'x':-1, 'y':-1},{'x':1, 'y':-1}];

        if(piece.getType() === 'b') {
            validMoves = checkMovesOfBoardWidePieces(piece, movementCoords);
        }

        return validMoves;

    };

    // caluclate valid moves for the queen
    var moveQueen = function(piece) {
        var validMoves = [];
        var movementCoords = [{'x':-1, 'y':1},{'x':0, 'y':1},{'x':1, 'y':1},
                              {'x':-1, 'y':0},{'x':1, 'y':0},
                              {'x':-1, 'y':-1},{'x':0, 'y':-1},{'x':1, 'y':-1}];

        if(piece.getType() === 'q') {
            validMoves = checkMovesOfBoardWidePieces(piece, movementCoords);
        }

        return validMoves;
    };

    // caluclate valid moves for the king
    var moveKing = function(piece) {
        var validMoves = [];
        var movementCoords = [{'x':-1, 'y':1},{'x':0, 'y':1},{'x':1, 'y':1},
                              {'x':-1, 'y':0},{'x':1, 'y':0},
                              {'x':-1, 'y':-1},{'x':0, 'y':-1},{'x':1, 'y':-1}];

        if(piece.getType() === 'k') {
            validMoves = checkPieceMoves(piece, movementCoords, true);
        }

        return validMoves;
    };

    return {
        movePawn : movePawn,
        moveKnight : moveKnight,
        moveRook : moveRook,
        moveBishop : moveBishop,
        moveQueen : moveQueen,
        moveKing : moveKing
    };

}();

module.exports = pieceMovementCalculator;
