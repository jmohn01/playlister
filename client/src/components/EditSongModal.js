import React, { Component } from 'react';

export default class EditSongModal extends Component {
    constructor(props) {
        super(props);
        if (this.props.songToEdit) {
            this.state = {
                isLoading: true,
                title: this.props.songToEdit.title,
                artist: this.props.songToEdit.artist,
                youTubeId: this.props.songToEdit.youTubeId
            };
        }
        else {
            this.state = {
                title: "?",
                artist: "?",
                youTubeId: "?"
            };
        }
    }

    handleConfirmEditSong = () => {
        let newSongData = {
            title: this.state.title,
            artist: this.state.artist,
            youTubeId: this.state.youTubeId
        };
        this.props.updateSongCallback(this.props.songIndex, newSongData);
    }

    handleCancelEditSongModal = () => {
        this.props.hideModalCallback();
    }

    handleUpdateTitle = (event) => {
        this.setState(
            { title: event.target.value }
        );
    }

    handleUpdateArtist = (event) => {
        this.setState(
            { artist: event.target.value }
        );
    }

    handleUpdateYouTubeId = (event) => {
        this.setState(
            { youTubeId: event.target.value }
        );
    }

    render() {
        const { isOpenCallback } = this.props;
        let modalClass = "modal";
        if (isOpenCallback()) {
            modalClass += " is-visible";
        }
        return (
            <div
                id="edit-song-modal"
                className={modalClass}
                data-animation="slideInOutLeft">
                <div
                    id='edit-song-root'
                    className="modal-root">
                    <div
                        id="edit-song-modal-header"
                        className="modal-north">Edit Song</div>
                    <div
                        id="edit-song-modal-content"
                        className="modal-center">
                        <div id="title-prompt" className="modal-prompt">Title:</div>
                        <input id="edit-song-modal-title-textfield" className='modal-textfield' type="text" defaultValue={this.props.songToEdit.title} onChange={this.handleUpdateTitle} />
                        <div id="artist-prompt" className="modal-prompt">Artist:</div>
                        <input id="edit-song-modal-artist-textfield" className='modal-textfield' type="text" defaultValue={this.state.artist} onChange={this.handleUpdateArtist} />
                        <div id="you-tube-id-prompt" className="modal-prompt">You Tube Id:</div>
                        <input id="edit-song-modal-youTubeId-textfield" className='modal-textfield' type="text" defaultValue={this.state.youTubeId} onChange={this.handleUpdateYouTubeId} />
                    </div>
                    <div className="modal-south">
                        <input type="button" id="edit-song-confirm-button" className="modal-button" value='Confirm' onClick={this.handleConfirmEditSong} />
                        <input type="button" id="edit-song-cancel-button" className="modal-button" value='Cancel' onClick={this.handleCancelEditSongModal} />
                    </div>
                </div>
            </div>
        );
    }
}