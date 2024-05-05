import React from 'react';
import {Label, Spinner} from '@patternfly/react-core';

const RecentTracks = ({recentTracks, isRecentTrackLoading}) => {
    return (
        <div>
            {isRecentTrackLoading ? (
                <Spinner/>
            ) : (
                /*TODO: scroll pagination over next data*/
                <div style={{overflowX: 'auto'}}>
                    <div style={{display: 'flex'}}>
                        {recentTracks.map((song) => (
                            <div key={song.id} style={{marginRight: '15px', marginBottom: '10px'}}>
                                <apple-music-artwork-lockup type="song" content-id={song.id} />
                                <div className="fw-lighter" style={{width: '250px', whiteSpace: 'initial'}}>
                                    <span className="mx-1">
                                        {song.attributes.name}
                                    </span>
                                    {song.attributes.genreNames.map((gn, index) => (
                                        <Label key={index} isCompact>{gn}</Label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentTracks;
