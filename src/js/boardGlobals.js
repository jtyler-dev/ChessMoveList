"use strict";

var boardGlobals = function() {
    return {
        MAX_SQ : 8,
        DEFAULT_BOARD : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w',
        whiteStartingRow : 6,
        blackStartingRow : 1,
        WHITE : 'w',
        BLACK : 'b'
    };
}();

module.exports = boardGlobals;
