import SongCard from './SongCard.js';
import React from "react";

export default class PlaylistCards extends React.Component {
    render() {
        const { currentList, 
                moveSongCallback, 
                showRemoveSongModalCallback,
                showEditSongModalCallback,
                updateSongCallback} = this.props;
        if (currentList === null) {
            return (
                <div id="playlist-cards"></div>
            )
        }
        else {
            return (
                <div id="playlist-cards">
                    {
                        currentList.songs.map((song, index) => (
                            <SongCard
                                id={'playlist-song-' + (index)}
                                key={'playlist-song-' + (index)}
                                index={index}
                                song={song}
                                moveCallback={moveSongCallback}
                                showRemoveSongModalCallback={showRemoveSongModalCallback}
                                showEditSongModalCallback={showEditSongModalCallback}
                                updateCallback={updateSongCallback} 
                            />
                        ))
                    }
                </div>
            )
        }
    }
}