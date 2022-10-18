import React from 'react';
import './App.css';

// IMPORT DATA MANAGEMENT AND TRANSACTION STUFF
import DBManager from './db/DBManager';
import jsTPS from './common/jsTPS.js';

// OUR TRANSACTIONS
import CreateSong_Transaction from './transactions/CreateSong_Transaction.js'
import MoveSong_Transaction from './transactions/MoveSong_Transaction.js';
import RemoveSong_Transaction from './transactions/RemoveSong_Transaction.js';
import UpdateSong_Transaction from './transactions/UpdateSong_Transaction.js';

// THESE REACT COMPONENTS ARE MODALS
import DeleteListModal from './components/DeleteListModal.js';
import EditSongModal from './components/EditSongModal.js';
import RemoveSongModal from './components/RemoveSongModal.js';

// THESE REACT COMPONENTS ARE IN OUR UI
import Banner from './components/Banner.js';
import EditToolbar from './components/EditToolbar.js';
import PlaylistCards from './components/PlaylistCards.js';
import SidebarHeading from './components/SidebarHeading.js';
import SidebarList from './components/SidebarList.js';
import Statusbar from './components/Statusbar.js';

const CurrentModal = {
    NONE : "NONE",
    DELETE_LIST : "DELETE_LIST",
    EDIT_SONG : "EDIT_SONG",
    REMOVE_SONG : "REMOVE_SONG"
}

class App extends React.Component {
    constructor(props) {
        super(props);

        // SETUP CTRL-Z AND CTRL-Y
        this.ctrlPressed = false;
        document.onkeydown = this.handleAppKeyDown;
        document.onkeyup = this.handleAppKeyUp;

        // THIS IS OUR TRANSACTION PROCESSING SYSTEM
        this.tps = new jsTPS();

        // THIS WILL TALK TO LOCAL STORAGE
        this.db = new DBManager();

        // GET THE SESSION DATA FROM OUR DATA MANAGER
        let loadedSessionData = this.db.queryGetSessionData();

        // SETUP THE INITIAL STATE
        this.state = {
            currentModal : CurrentModal.NONE,
            listKeyPairMarkedForDeletion : null,
            currentList : null,
            currentSongIndex : -1,
            currentSong : null,
            sessionData : loadedSessionData
        }
    }
    handleAppKeyDown = (keyEvent) => {
        let CTRL_KEY_CODE = "17";
        if (keyEvent.which === CTRL_KEY_CODE) {
            this.ctrlPressed = true;
        }
        else if (keyEvent.key.toLowerCase() === "z") {
            if (this.ctrlPressed) {
                this.undo();
            }
        }
        else if (keyEvent.key.toLowerCase() === "y") {
            if (this.ctrlPressed) {
                this.redo();
            }
        }
    }
    handleAppKeyUp = (keyEvent) => {
        if (keyEvent.which === "17")
            this.ctrlPressed = false;
    }
    sortKeyNamePairsByName = (keyNamePairs) => {
        keyNamePairs.sort((keyPair1, keyPair2) => {
            // GET THE LISTS
            return keyPair1.name.localeCompare(keyPair2.name);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CREATING A NEW LIST
    createNewList = () => {
        // FIRST FIGURE OUT WHAT THE NEW LIST'S KEY AND NAME WILL BE
        let newKey = this.state.sessionData.nextKey;
        let newName = "Untitled" + newKey;

        // MAKE THE NEW LIST
        let newList = {
            key: newKey,
            name: newName,
            songs: []
        };

        // MAKE THE KEY,NAME OBJECT SO WE CAN KEEP IT IN OUR
        // SESSION DATA SO IT WILL BE IN OUR LIST OF LISTS
        let newKeyNamePair = { "key": newKey, "name": newName };
        let updatedPairs = [...this.state.sessionData.keyNamePairs, newKeyNamePair];
        this.sortKeyNamePairsByName(updatedPairs);

        // CHANGE THE APP STATE SO THAT THE CURRENT LIST IS
        // THIS NEW LIST AND UPDATE THE SESSION DATA SO THAT THE
        // NEXT LIST CAN BE MADE AS WELL. NOTE, THIS setState WILL
        // FORCE A CALL TO render, BUT THIS UPDATE IS ASYNCHRONOUS,
        // SO ANY AFTER EFFECTS THAT NEED TO USE THIS UPDATED STATE
        // SHOULD BE DONE VIA ITS CALLBACK
        this.setState(prevState => ({
            currentModal : CurrentModal.NONE,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newList,
            currentSongIndex : -1,
            currentSong : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey + 1,
                counter: prevState.sessionData.counter + 1,
                keyNamePairs: updatedPairs
            }
        }), () => {
            // PUTTING THIS NEW LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationCreateList(newList);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF DELETING A LIST.
    deleteList = (key) => {
        // IF IT IS THE CURRENT LIST, CHANGE THAT
        let newCurrentList = null;
        if (this.state.currentList) {
            if (this.state.currentList.key !== key) {
                // THIS JUST MEANS IT'S NOT THE CURRENT LIST BEING
                // DELETED SO WE'LL KEEP THE CURRENT LIST AS IT IS
                newCurrentList = this.state.currentList;
            }
        }

        let keyIndex = this.state.sessionData.keyNamePairs.findIndex((keyNamePair) => {
            return (keyNamePair.key === key);
        });
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        if (keyIndex >= 0)
            newKeyNamePairs.splice(keyIndex, 1);

        // AND FROM OUR APP STATE
        this.setState(prevState => ({
            currentModal : CurrentModal.NONE,
            listKeyPairMarkedForDeletion : null,
            currentList: newCurrentList,
            currentSongIndex : -1,
            currentSong : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter - 1,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // DELETING THE LIST FROM PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationDeleteList(key);

            // SO IS STORING OUR SESSION DATA
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    deleteMarkedList = () => {
        this.deleteList(this.state.listKeyPairMarkedForDeletion.key);
        this.hideModal();
    }
    // THIS FUNCTION SPECIFICALLY DELETES THE CURRENT LIST
    deleteCurrentList = () => {
        if (this.state.currentList) {
            this.deleteList(this.state.currentList.key);
        }
    }
    renameList = (key, newName) => {
        let newKeyNamePairs = [...this.state.sessionData.keyNamePairs];
        // NOW GO THROUGH THE ARRAY AND FIND THE ONE TO RENAME
        for (let i = 0; i < newKeyNamePairs.length; i++) {
            let pair = newKeyNamePairs[i];
            if (pair.key === key) {
                pair.name = newName;
            }
        }
        this.sortKeyNamePairsByName(newKeyNamePairs);

        // WE MAY HAVE TO RENAME THE currentList
        let currentList = this.state.currentList;
        if (currentList.key === key) {
            currentList.name = newName;
        }

        this.setState(prevState => ({
            currentModal : CurrentModal.NONE,
            listKeyPairMarkedForDeletion : null,
            currentList : prevState.currentList,
            currentSongIndex : -1,
            currentSong : null,
            sessionData: {
                nextKey: prevState.sessionData.nextKey,
                counter: prevState.sessionData.counter,
                keyNamePairs: newKeyNamePairs
            }
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            let list = this.db.queryGetList(key);
            list.name = newName;
            this.db.mutationUpdateList(list);
            this.db.mutationUpdateSessionData(this.state.sessionData);
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF LOADING A LIST FOR EDITING
    loadList = (key) => {
        let newCurrentList = this.db.queryGetList(key);
        this.setState(prevState => ({
            currentModal : CurrentModal.NONE,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: newCurrentList,
            currentSongIndex : -1,
            currentSong : null,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    // THIS FUNCTION BEGINS THE PROCESS OF CLOSING THE CURRENT LIST
    closeCurrentList = () => {
        this.setState(prevState => ({
            currentModal : CurrentModal.NONE,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList: null,
            currentSongIndex : -1,
            currentSong : null,
            sessionData: this.state.sessionData
        }), () => {
            // AN AFTER EFFECT IS THAT WE NEED TO MAKE SURE
            // THE TRANSACTION STACK IS CLEARED
            this.tps.clearAllTransactions();
        });
    }
    setStateWithUpdatedList = (list) => {
        this.setState(prevState => ({
            currentModal : CurrentModal.NONE,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : list,
            currentSongIndex : -1,
            currentSong : null,
            sessionData : this.state.sessionData
        }), () => {
            // UPDATING THE LIST IN PERMANENT STORAGE
            // IS AN AFTER EFFECT
            this.db.mutationUpdateList(this.state.currentList);
        });
    }
    getPlaylistSize = () => {
        return this.state.currentList.songs.length;
    }
    addNewSong = () => {
        let index = this.getPlaylistSize();
        this.addCreateSongTransaction(index, "Untitled", "?", "dQw4w9WgXcQ");
    }
    // THIS FUNCTION CREATES A NEW SONG IN THE CURRENT LIST
    // USING THE PROVIDED DATA AND PUTS THIS SONG AT INDEX
    createSong = (index, song) => {
        let list = this.state.currentList;      
        list.songs.splice(index, 0, song);
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION MOVES A SONG IN THE CURRENT LIST FROM
    // start TO end AND ADJUSTS ALL OTHER ITEMS ACCORDINGLY
    moveSong = (start, end) => {
        let list = this.state.currentList;

        // WE NEED TO UPDATE THE STATE FOR THE APP
        if (start < end) {
            let temp = list.songs[start];
            for (let i = start; i < end; i++) {
                list.songs[i] = list.songs[i + 1];
            }
            list.songs[end] = temp;
        }
        else if (start > end) {
            let temp = list.songs[start];
            for (let i = start; i > end; i--) {
                list.songs[i] = list.songs[i - 1];
            }
            list.songs[end] = temp;
        }
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION REMOVES THE SONG AT THE index LOCATION
    // FROM THE CURRENT LIST
    removeSong = (index) => {
        let list = this.state.currentList;      
        list.songs.splice(index, 1); 
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCTION UPDATES THE TEXT IN THE ITEM AT index TO text
    updateSong = (index, songData) => {
        let list = this.state.currentList;
        let song = list.songs[index];
        song.title = songData.title;
        song.artist = songData.artist;
        song.youTubeId = songData.youTubeId;
        this.setStateWithUpdatedList(list);
    }
    // THIS FUNCDTION ADDS A CreateSong_Transaction TO THE TRANSACTION STACK
    addCreateSongTransaction = (index, title, artist, youTubeId) => {
        // ADD A SONG ITEM AND ITS NUMBER
        let song = {
            title: title,
            artist: artist,
            youTubeId: youTubeId
        };
        let transaction = new CreateSong_Transaction(this, index, song);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION ADDS A MoveSong_Transaction TO THE TRANSACTION STACK
    addMoveSongTransaction = (start, end) => {
        let transaction = new MoveSong_Transaction(this, start, end);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION ADDS A RemoveSong_Transaction TO THE TRANSACTION STACK
    addRemoveSongTransaction = () => {
        let index = this.state.currentSongIndex;
        let song = this.state.currentList.songs[index];
        let transaction = new RemoveSong_Transaction(this, index, song);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION ADDS AN UpdateSong_Transaction TO THE TRANSACTION STACK
    addUpdateSongTransaction = (index, newSongData) => {
        // GET THE CURRENT TEXT
        let song = this.state.currentList.songs[index];
        let oldSongData = {
            title: song.title,
            artist: song.artist,
            youTubeId: song.youTubeId
        };
        let transaction = new UpdateSong_Transaction(this, index, oldSongData, newSongData);
        this.tps.addTransaction(transaction);
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING AN UNDO
    undo = () => {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    // THIS FUNCTION BEGINS THE PROCESS OF PERFORMING A REDO
    redo = () => {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.doTransaction();

            // MAKE SURE THE LIST GETS PERMANENTLY UPDATED
            this.db.mutationUpdateList(this.state.currentList);
        }
    }
    markListForDeletion = (keyPair) => {
        this.setState(prevState => ({
            currentModal: CurrentModal.NONE,
            listKeyPairMarkedForDeletion : keyPair,
            currentList: prevState.currentList,
            currentSongIndex : -1,
            currentSong : null,
            sessionData: prevState.sessionData
        }), () => {
            // PROMPT THE USER
            this.showDeleteListModal();
        });
    }
    setCurrentModal = (newModalState, songIndex, song) => {
        this.setState(prevState => ({
            currentModal : newModalState,
            listKeyPairMarkedForDeletion : prevState.listKeyPairMarkedForDeletion,
            currentList : prevState.currentList,
            currentSongIndex : songIndex,
            currentSong : song,
            sessionData : this.state.sessionData
        }), () => {
            // WE MAY WISH TO DO SOMETHING HERE
        });        
    }
    // THIS FUNCTION SHOWS THE MODAL FOR PROMPTING THE USER
    // TO SEE IF THEY REALLY WANT TO DELETE THE LIST
    showDeleteListModal = () => {
        this.setCurrentModal(CurrentModal.DELETE_LIST, -1, null);
    }
    showEditSongModal = (songIndex) => {
        let songToEdit = this.state.currentList.songs[songIndex];
        this.setCurrentModal(CurrentModal.EDIT_SONG, songIndex, songToEdit);
    }
    showRemoveSongModal = (songIndex) => {
        let songToRemove = this.state.currentList.songs[songIndex];
        this.setCurrentModal(CurrentModal.REMOVE_SONG, songIndex, songToRemove);
    }
    // THIS FUNCTION IS FOR HIDING THE MODAL
    hideModal = () => {
        this.setCurrentModal(CurrentModal.NONE);
    }
    isDeleteListModalOpen = () => {
        return this.state.currentModal === CurrentModal.DELETE_LIST;
    }
    isEditSongModalOpen = () => {
        return this.state.currentModal === CurrentModal.EDIT_SONG;
    }
    isRemoveSongModalOpen = () => {
        return this.state.currentModal === CurrentModal.REMOVE_SONG;
    }
    render() {
        let canAddSong = this.state.currentList !== null;
        let canUndo = this.tps.hasTransactionToUndo();
        let canRedo = this.tps.hasTransactionToRedo();
        let canClose = this.state.currentList !== null;
        let editSongModal;
        if (this.isEditSongModalOpen()) {
            editSongModal = 
            <EditSongModal
                isOpenCallback={this.isEditSongModalOpen}
                hideModalCallback={this.hideModal}
                songIndex={this.state.currentSongIndex}
                songToEdit={this.state.currentSong}
                updateSongCallback={this.addUpdateSongTransaction}
            />
        }
        return (
            <div id="app-root">
                <Banner />
                <SidebarHeading
                    createNewListCallback={this.createNewList}
                />
                <SidebarList
                    currentList={this.state.currentList}
                    keyNamePairs={this.state.sessionData.keyNamePairs}
                    deleteListCallback={this.markListForDeletion}
                    loadListCallback={this.loadList}
                    renameListCallback={this.renameList}
                />
                <EditToolbar
                    canAddSong={canAddSong}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    canClose={canClose} 
                    addSongCallback={this.addNewSong}
                    undoCallback={this.undo}
                    redoCallback={this.redo}
                    closeCallback={this.closeCurrentList}
                />
                <PlaylistCards
                    currentList={this.state.currentList}
                    moveSongCallback={this.addMoveSongTransaction}
                    showRemoveSongModalCallback={this.showRemoveSongModal}
                    showEditSongModalCallback={this.showEditSongModal}
                    updateSongCallback={this.addUpdateSongTransaction} />
                <Statusbar 
                    currentList={this.state.currentList} />
                <DeleteListModal
                    isOpenCallback={this.isDeleteListModalOpen}
                    hideModalCallback={this.hideModal}
                    listKeyPair={this.state.listKeyPairMarkedForDeletion}
                    deleteListCallback={this.deleteMarkedList}
                />
                {editSongModal}
                <RemoveSongModal
                    isOpenCallback={this.isRemoveSongModalOpen}
                    hideModalCallback={this.hideModal}
                    songIndex={this.state.songIndex}
                    songToRemove={this.state.currentSong}
                    removeSongCallback={this.addRemoveSongTransaction}
                />
            </div>
        );
    }
}

export default App;