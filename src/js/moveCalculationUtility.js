"use strict";

var moveCalculationUtility = (function (){
    var turnColor = 'w';

    // ---------------------------------------------
    // helper functions

    // checks to see if a given space is within the board limits
    var checkOnBoard = function(row, col) {
        return (row >= 0 && row < 8) && (col >= 0 && col < 8);
    };

    // checks to see if a space is empty
    var isEmpty = function(space) {
        return Object.keys(space).length === 0;
    };

    var isEmptyLoc = function (spaceLoc) {
        return Object.keys(spaceLoc).length === 0;
    };

    var checkIfTakable = function(spaceLoc) {
        return !isEmptyLoc(spaceLoc) && spaceLoc.piece.color !== turnColor;
    };

    // detemines the human readable direction for a valid move
    var determineMoveDirection = function(rowDir, colDir) {
        // based off of numPad directions
        var dirStr = {"key-11": 1, "key-10": 2, "key-1-1": 3, "key01": 4,
                      "key0-1": 6, "key11": 7, "key10": 8, "key1-1": 9};
        var keyStr = "key" + rowDir + colDir;

        return dirStr[keyStr];
    };

    var checkMovesOfBoardWidePieces = function(board, movementCoords, pieceLoc) {
        var piece = pieceLoc.piece;
        var piecePos = pieceLoc.location;
        var validMoves = [];
        var direction = (piece.color === 'w') ? -1 : 1;
        var moveDir = 0;

        for(var i = 0; i < movementCoords.length; i++) {
            var movement = movementCoords[i];
            // since this a piece that can move board wide, we are only going to
            // record the start and the end of its movement and the direction
            var moveStart = null;
            var moveEnd = null;

            for(var step = 1; step < 8; step++) {
                var posX = (direction * movement.x * step) + piecePos.row;
                var posY = (direction * movement.y * step) + piecePos.col;

                if(checkOnBoard(posX, posY))
                {
                    if(step === 1) {
                        moveDir = determineMoveDirection(piecePos.row - posX, piecePos.col - posY);
                    }

                    // move within the boundries of the board
                    var spaceLoc = board.findPiece(posX, posY);

                    // if space is empty
                    if(isEmptyLoc(spaceLoc)) {
                        // if this is the first step, set first validMove to this one
                        if(moveStart === null) {
                            moveStart = {"location": {"row": posX, "col": posY}};
                        } else {
                            // else set lastMove to this
                            moveEnd = {"location": {"row": posX, "col": posY}};
                        }
                    } else if(spaceLoc.piece.color !== piece.color) {
                        // else if space is not empty and is oppentents piece,
                        // set first and last move to this step, break since we cant move any more
                        if (moveStart === null) {
                            moveStart = spaceLoc;
                            moveEnd = spaceLoc;
                        } else {
                            moveEnd = spaceLoc;
                        }

                        validMoves.push({'piece': piece.piece,
                                         'pieceLoc':pieceLoc.location,
                                         'moveDir': moveDir,
                                         'moveStart': moveStart, 'moveEnd': moveEnd});
                        break;
                    } else {
                        // else space is not empty and is friendly piece so we cannot move

                        // case where we move one space then the next step puts a friendly piece in
                        // font of us so we have a moveStart, but no moveEnd and just
                        // set moveEnd be moveStart
                        if(moveStart !== null && moveEnd === null) {
                            moveEnd = moveStart;
                        }

                        if(moveStart !== null && moveEnd !== null) {
                            validMoves.push({'piece': piece.piece,
                                             'pieceLoc':pieceLoc.location,
                                             'moveDir': moveDir,
                                             'moveStart': moveStart, 'moveEnd': moveEnd});
                        }

                        break;
                    }

                } else {
                    // continuing to move in this diretion will result in
                    // more of the moves not being on the bord so break

                    // check to see if there are valid moves and add them to the array if there are

                    // case were step 1 is valid space, but then the next step is not a valid move
                    if(moveStart !== null && moveEnd === null) {
                        moveEnd = moveStart;
                    }

                    if(moveStart !== null && moveEnd !== null) {
                        validMoves.push({'piece': piece.piece,
                                         'pieceLoc':pieceLoc.location,
                                         'moveDir': moveDir,
                                         'moveStart': moveStart, 'moveEnd': moveEnd});
                    }

                    break;
                }
            }
        }
        return validMoves;
    };

    // ---------------------------------------------

    // caluclate pieces valid moves
    // caluclate valid moves for pawns
    var movePawn = function(board, pieceLoc) {
        // get the piece on the board we are looking at
        var validMoves = [];

        // check to see it is a valid pawn
        if(!isEmptyLoc(pieceLoc) && pieceLoc.piece.piece === 'p') {
            var direction = (pieceLoc.piece.color === 'w') ? -1 : 1;
            var row = pieceLoc.location.row;
            var col = pieceLoc.location.col;

            // if a pawn has not been moved from the stating position is can
            // move forward 2 spaces. The pawn may move only two spaces if the first space is empty.
            if((row === 1 && pieceLoc.piece.color === 'b')  || (row === 6 && pieceLoc.piece.color === 'w')) {
                // if the space infront of the pawn is clear and the space
                // 2 tiles ahead of the pawn is clear, moving 2 spaces from the starting
                // rank is valid
                if(isEmptyLoc(board.findPiece(row + direction, col)) &&
                   isEmptyLoc(board.findPiece(row + (2 * direction), col))) {
                    validMoves.push({'piece': pieceLoc.piece.piece,
                                     'pieceLoc':pieceLoc.location,
                                     'moveDir': (direction > 0) ? 2 : 8,
                                     'moveLoc': {'row': row + (2 * direction),'col':col}});
                }
            }
            // pawn movement is unique since it only moves forward and can
            // only attack diagonal, so we have to do some special checking

            // pawn movement is 1 space infront of it
            var move = row + direction;
            // check if pawn can move 1 space infront of it
            if(checkOnBoard(move, col) && isEmptyLoc(board.findPiece(move,col))) {
                validMoves.push({'piece': pieceLoc.piece.piece,
                                 'pieceLoc':pieceLoc.location,
                                 'moveDir': (direction > 0) ? 2 : 8,
                                 'moveLoc': {'row': move,'col':col}});
            }

            // pawn can also more diagonal if it takes a piece
            // check it pawn can take piece that
            if(checkOnBoard(move, col + 1) &&
               !isEmptyLoc(board.findPiece(move, col + 1)) &&
               checkIfTakable(board.findPiece(move, col + 1))){
                validMoves.push({'piece': pieceLoc.piece.piece,
                                 'pieceLoc':pieceLoc.location,
                                 'moveDir': (direction > 0) ? 3 : 9,
                                 'moveLoc': {'row': move,'col':col+1}});
            }

            if(checkOnBoard(move, col - 1) &&
               !isEmptyLoc(board.findPiece(move, col - 1)) &&
               checkIfTakable(board.findPiece(move, col - 1))){
                validMoves.push({'piece': pieceLoc.piece.piece,
                                 'pieceLoc':pieceLoc.location,
                                 'moveDir': (direction > 0) ? 1 : 7,
                                 'moveLoc': {'row': move,'col':col-1}});
            }
        }

        return validMoves;
    };

    // caluclate valid moves for rooks
    // valid rook movement is up/down left/right as far as it wants
    var moveRook = function(board, pieceLoc) {
        var validMoves = [];
        // movementCoords repersent how the piece can move on in cartesian plane
        var movementCoords = [{'x':0, 'y':1},{'x':-1, 'y':0},
                              {'x':1, 'y':0},{'x':0, 'y':-1}];

        if(!isEmptyLoc(pieceLoc) && pieceLoc.piece.piece === 'r') {
            validMoves = checkMovesOfBoardWidePieces(board, movementCoords, pieceLoc);
        }

        return validMoves;
    };

    // caluclate valid moves for knights
    var moveKnight = function(board, pieceLoc) {
        var validMoves = [];
        var movementCoords = [{'x':-1, 'y':2}, {'x':1, 'y':2}, {'x':-2, 'y':1},
                              {'x':2, 'y':1}, {'x':-2, 'y':-1}, {'x':2, 'y':-1},
                              {'x':-1, 'y':-2}, {'x':1, 'y':-2}];

        if(!isEmptyLoc(pieceLoc) && pieceLoc.piece.piece === 'n') {
            var direction = (pieceLoc.color === 'w') ? -1 : 1;
            var row = pieceLoc.location.row;
            var col = pieceLoc.location.col;

            for(var i = 0; i < movementCoords.length;i++) {
                var position = movementCoords[i];

                var posX = (direction * position.x) + row;
                var posY = (direction * position.y) + col;

                if(checkOnBoard(posX, posY))
                {
                    var moveLoc = board.findPiece(posX, posY);
                    if(isEmptyLoc(moveLoc) || checkIfTakable(moveLoc)) {
                        validMoves.push({'piece': pieceLoc.piece.piece,
                                         'pieceLoc':pieceLoc.location,
                                         'moveDir': 0,
                                         'moveLoc': {'row': posX, 'col':posY}});
                    }
                }
            }
        }

        return validMoves;
    };

    // caluclate valid moves for bishops
    var moveBishop = function(board, pieceLoc) {
        var validMoves = [];
        var movementCoords = [{'x':-1, 'y':1},{'x':1, 'y':1},
                          {'x':-1, 'y':-1},{'x':1, 'y':-1}];

        if(!isEmptyLoc(pieceLoc) && pieceLoc.piece.piece === 'b') {
            validMoves = checkMovesOfBoardWidePieces(board, movementCoords, pieceLoc);
        }

        return validMoves;
    };

    // caluclate valid moves for the queen
    var moveQueen = function(board, pieceLoc) {
        var validMoves = [];
        var movementCoords = [{'x':-1, 'y':1},{'x':0, 'y':1},{'x':1, 'y':1},
                              {'x':-1, 'y':0},{'x':1, 'y':0},
                              {'x':-1, 'y':-1},{'x':0, 'y':-1},{'x':1, 'y':-1}];

        if(!isEmptyLoc(pieceLoc) && pieceLoc.piece.piece === 'q') {
            validMoves = checkMovesOfBoardWidePieces(board, movementCoords, pieceLoc);
        }

        return validMoves;
    };

    // caluclate valid moves for the king
    var moveKing = function(board, pieceLoc) {
        var validMoves = [];
        var movementCoords = [{'x':-1, 'y':1},{'x':0, 'y':1},{'x':1, 'y':1},
                              {'x':-1, 'y':0},{'x':1, 'y':0},{'x':-1, 'y':-1},
                              {'x':0, 'y':-1},{'x':1, 'y':-1}];

        if(!isEmptyLoc(pieceLoc) && pieceLoc.piece.piece === 'k') {
            var direction = (pieceLoc.piece.piece.color === 'w') ? -1 : 1;
            var row = pieceLoc.location.row;
            var col = pieceLoc.location.col;

            for(var i = 0; i < movementCoords.length; i++) {
                var movement = movementCoords[i];

                var posX = (direction * movement.x) + row;
                var posY = (direction * movement.y) + col;

                if(checkOnBoard(posX, posY))
                {
                    var moveDir = determineMoveDirection(row - posX, col - posY);

                    var moveLoc = board.findPiece(posX, posY);
                    if(isEmptyLoc(moveLoc) || checkIfTakable(moveLoc)) {
                        validMoves.push({'piece': pieceLoc.piece.piece,
                                         'pieceLoc':pieceLoc.location,
                                         'moveDir': moveDir,
                                         'moveLoc': {'row': posX, 'col':posY}});
                    }
                }
            }
        }

        return validMoves;
    };

    var getValidMovesForPiece = function (board, turn, pieceLoc) {
        turnColor = turn;
        var piece = !isEmptyLoc(pieceLoc) ? pieceLoc.piece : null;
        var validMoves = [];

        switch (piece.piece) {
            case 'p':
                validMoves = this.movePawn(board, pieceLoc);
                break;
            case 'r':
                validMoves = this.moveRook(board, pieceLoc);
                break;
            case 'n':
                validMoves = this.moveKnight(board, pieceLoc);
                break;
            case 'b':
                validMoves = this.moveBishop(board, pieceLoc);
                break;
            case 'q':
                validMoves = this.moveQueen(board, pieceLoc);
                break;
            case 'k':
                validMoves = this.moveKing(board, pieceLoc);
                break;
            default:
                break;
        };

        return validMoves;
    };

    return {
        movePawn: movePawn,
        moveRook: moveRook,
        moveKnight: moveKnight,
        moveBishop: moveBishop,
        moveQueen: moveQueen,
        moveKing: moveKing,
        getValidMovesForPiece: getValidMovesForPiece
    };

})();

module.exports = moveCalculationUtility;
