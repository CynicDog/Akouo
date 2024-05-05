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

function AppleMusicArea({developerToken, musicUserToken}) {

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
                                        {applePlaylists.data.length}
                                    </span>
                                </Badge>
                            </>
                        }
                        displaySize="lg"
                        onToggle={onToggle}
                        isExpanded={isExpanded}>
                        {applePlaylists.data.map(playlist => (
                            <PlaylistCard key={playlist.id} playlist={playlist} developerToken={developerToken}
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

    const {data: songs, isLoading: isSongLoading} = useQuery(
        ['playlistSongs', playlist.id],
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
                {isSongLoading ? (
                    <div className="d-flex justify-content-center">
                        <Spinner/>
                    </div>
                ) : (
                    <CardBody>
                        <SongList songs={songs.data}/>
                    </CardBody>
                )}
            </CardExpandableContent>
        </Card>
    );
};

const SongList = ({songs}) => {
    return (
        <List isPlain isBordered>
            {songs.map((song, index) => (
                <ListItem className="d-flex fw-lighter" key={index}>
                    <span className="fw-light">
                        {song.attributes.name} {' '}
                        <Label isCompact>
                        {song.attributes.genreNames.join(",")}
                    </Label>
                    </span>
                    <span className="ms-auto">
                        <Label isCompact>
                            {song.attributes.artistName}
                        </Label>
                        <Label isCompact color="blue">
                            {song.attributes.albumName}
                        </Label>
                    </span>
                </ListItem>
            ))}
        </List>
    );
};

export default AppleMusicArea;
