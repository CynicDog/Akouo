import React from 'react';
import {useQuery} from 'react-query';
import {fetchLibraryPlaylistRelationByName, fetchLibraryPlaylists} from '../../data/appleAPI.js';
import {
    Spinner,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    List,
    ListItem,
    CardExpandableContent, Label, Tooltip, ExpandableSection, Badge
} from '@patternfly/react-core';

function Playlists({developerToken, musicUserToken}) {

    const [isExpanded, setIsExpanded] = React.useState(false);
    const onToggle = (_event, isExpanded) => {
        setIsExpanded(isExpanded);
    };

    const {data: applePlaylists = [], isLoading: isApplePlaylistLoading} = useQuery(
        'applePlaylists',
        () => fetchLibraryPlaylists(developerToken, musicUserToken),
        {enabled: !!musicUserToken}
    );

    return (
        <>
            {isApplePlaylistLoading ? (
                <div className="d-flex justify-content-center">
                    <Spinner/>
                </div>
            ) : (
                <div className="my-3">
                    <ExpandableSection
                        toggleContent={
                            <>
                                <span className="fw-lighter">
                                    Apple Music Playlists
                                </span> {' '}
                                <Badge isRead>
                                    <span className="fw-lighter">
                                        {applePlaylists.meta.total}
                                    </span>
                                </Badge>
                            </>
                        }
                        displaySize="lg"
                        onToggle={onToggle}
                        isExpanded={isExpanded}>
                        {applePlaylists.data.map(playlist => (
                            <PlaylistCard
                                key={playlist.id}
                                playlist={playlist}
                                developerToken={developerToken}
                                musicUserToken={musicUserToken}/>
                        ))}
                    </ExpandableSection>
                </div>
            )}
        </>
    );
}

const PlaylistCard = ({playlist, developerToken, musicUserToken}) => {

    const [isExpanded, setIsExpanded] = React.useState(false);
    const onToggle = () => {
        setIsExpanded(prevExpanded => !prevExpanded);
    };

    const {data: tracks, isLoading: isTrackLoading} = useQuery(
        ['playlistTracks', playlist.id],
        () => fetchLibraryPlaylistRelationByName(developerToken, musicUserToken, playlist.id, 'tracks'),
        {
            enabled: !!playlist.id,
            staleTime: 7_200_000 // 2 hours
        }
    );

    function trimDateTime(dateTimeString) {
        const tIndex = dateTimeString.indexOf('T');

        if (tIndex !== -1) {
            return dateTimeString.substring(0, tIndex);
        } else {
            return dateTimeString;
        }
    }

    return (
        <Card key={playlist.id} id={playlist.id} isExpanded={isExpanded}>
            <CardHeader id={playlist.id} onExpand={onToggle}>
                <CardTitle>
                    {playlist.attributes.name} {' '}
                    <Tooltip content={<div>date added</div>}>
                        <Label isCompact>
                            {trimDateTime(playlist.attributes.dateAdded)}
                        </Label>
                    </Tooltip>{' '}
                    <Tooltip content={<div>last modified</div>}>
                        <Label isCompact color="gold">
                            {trimDateTime(playlist.attributes.lastModifiedDate)}
                        </Label>
                    </Tooltip>
                </CardTitle>
            </CardHeader>
            <CardExpandableContent>
                {isTrackLoading ? (
                    <div className="d-flex justify-content-center">
                        <Spinner/>
                    </div>
                ) : (
                    <CardBody>
                        <TrackList tracks={tracks.data}/>
                    </CardBody>
                )}
            </CardExpandableContent>
        </Card>
    );
};

const TrackList = ({tracks}) => {
    return (
        <List isPlain isBordered>
            {tracks.map((track, index) => (
                <ListItem className="d-flex fw-lighter" key={index}>
                    <span className="fw-light">
                        {track.attributes.name} {' '}
                        <Label isCompact>
                        {track.attributes.genreNames.join(",")}
                    </Label>
                    </span>
                    <span className="ms-auto">
                        <Tooltip content={<div>{track.attributes.artistName}</div>}>
                            <Label textMaxWidth="100px" isCompact>
                                {track.attributes.artistName}
                            </Label>
                        </Tooltip> {' '}
                        <Tooltip content={<div>{track.attributes.albumName}</div>}>
                            <Label isCompact textMaxWidth="100px" color="blue">
                                {track.attributes.albumName}
                            </Label>
                        </Tooltip>
                    </span>
                </ListItem>
            ))}
        </List>
    );
};

export default Playlists;
