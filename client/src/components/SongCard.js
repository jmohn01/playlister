import React from "react";

export default class SongCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isDragging: false,
            draggedTo: false
        }
    }
    handleDragStart = (event) => {
        event.dataTransfer.setData("song", this.props.index);
        this.setState(prevState => ({
            isDragging: true,
            draggedTo: prevState.draggedTo
        }));
    }
    handleDragOver = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragEnter = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: true
        }));
    }
    handleDragLeave = (event) => {
        event.preventDefault();
        this.setState(prevState => ({
            isDragging: prevState.isDragging,
            draggedTo: false
        }));
    }
    handleDrop = (event) => {
        event.preventDefault();
        let targetIndex = this.props.index;
        let sourceIndex = Number(event.dataTransfer.getData("song"));
        
        this.setState(prevState => ({
            isDragging: false,
            draggedTo: false
        }));

        // ASK THE MODEL TO MOVE THE DATA
        this.props.moveCallback(sourceIndex, targetIndex);
    }
    handleEditSong = () => {
        this.setState(prevState => ({
            editActive: !prevState.editActive
        }));
    }
    handleRemoveSong = () => {
        let songIndex = this.props.index;
        this.props.showRemoveSongModalCallback(songIndex);
    }
    handleClick = (event) => {
        // DOUBLE CLICK IS FOR SONG EDITING
        if (event.detail === 2) {
            this.handleEditSong(event);
            let songIndex = this.props.index;
            this.props.showEditSongModalCallback(songIndex);
        }
    }

    render() {
        const { song, index } = this.props;
        let itemClass = "list-card unselected-list-card";
        return (
            <div
                key={index}
                id={'song-' + index + '-card'}
                className={itemClass}
                onDragStart={this.handleDragStart}
                onDragOver={this.handleDragOver}
                onDragEnter={this.handleDragEnter}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
                draggable="true"
                onClick={this.handleClick}
            >
                {index+1}. 
                <a 
                    id={'song-' + index + '-link'}
                    className="song-link"
                    href={"https://www.youtube.com/watch?v=" + song.youTubeId}>
                        {song.title} by {song.artist}
                </a>
              <input 
                    type="button" 
                    id={"remove-song-" + index} 
                    className="list-card-button" 
                    value={"\u2715"}
                    onClick={this.handleRemoveSong} 
                />
            </div>
        )
    }
}