import jsTPS_Transaction from "../common/jsTPS.js"

/**
 * UpdateSong_Transaction
 * 
 * This class represents a transaction that updates a song
 * in the playlist. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class UpdateSong_Transaction extends jsTPS_Transaction {
    constructor(initApp, initIndex, initOldSongData, initNewSongData) {
        super();
        this.app = initApp;
        this.index = initIndex;
        this.oldSongData = initOldSongData;
        this.newSongData = initNewSongData;
    }

    doTransaction() {
        this.app.updateSong(this.index, this.newSongData);
    }
    
    undoTransaction() {
        this.app.updateSong(this.index, this.oldSongData);
    }
}