import React, { Component } from 'react';

export default class DeleteListModal extends Component {
    handleConfirmDeleteList = () => {
        this.props.deleteListCallback();
    }

    handleCancelDeleteList = () => {
        this.props.hideModalCallback();
    }

    render() {
        const { 
            isOpenCallback, 
            listKeyPair } = this.props;
        let name = "";
        if (listKeyPair) {
            name = listKeyPair.name;
        }
        let modalClass = "modal";
        if (isOpenCallback()) {
            modalClass += " is-visible";
        }
        return (
            <div
                id="delete-list-modal"
                className={modalClass}
                data-animation="slideInOutLeft">
                <div className="modal-root" id='verify-delete-list-root'>
                    <div className="modal-north">
                    Delete the {name} playlist?
                    </div>
                    <div className="modal-center">
                        <div className="modal-center-content">
                            Are you sure you wish to permanently delete the {name} playlist?
                        </div>
                    </div>
                    <div className="modal-south">
                        <input type="button" id="remove-song-confirm-button" className="modal-button" onClick={this.handleConfirmDeleteList} value='Confirm' />
                        <input type="button" id="remove-song-cancel-button" className="modal-button" onClick={this.handleCancelDeleteList} value='Cancel' />
                    </div>
                </div>
            </div>
        );
    }
}