import React from 'react';
import {useQuery} from 'react-query';
import {fetchLibraryPlaylistRelationByName, fetchLibraryPlaylists} from '../../data/appleAPI.js';
import {
    Spinner,
    List,
    ListItem,
    Label,
    Tooltip,
    ExpandableSection,
    Badge,
    DrawerCloseButton,
    DrawerActions,
    DrawerHead,
    DrawerPanelContent, Drawer, DrawerContent, DrawerContentBody, CardBody
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
                        <List isPlain isBordered>
                            {applePlaylists.data.map(playlist => (
                                <PlaylistCard
                                    key={playlist.id}
                                    playlist={playlist}
                                    developerToken={developerToken}
                                    musicUserToken={musicUserToken}/>
                            ))}
                        </List>
                    </ExpandableSection>
                </div>
            )}
        </>
    );
}

const PlaylistCard = ({playlist, developerToken, musicUserToken}) => {

    const [isExpanded, setIsExpanded] = React.useState(false);
    const drawerRef = React.useRef();

    const {data: tracks, isLoading: isTrackLoading} = useQuery(
        ['playlistTracks', playlist.id],
        () => fetchLibraryPlaylistRelationByName(developerToken, musicUserToken, playlist.id, 'tracks'),
        {
            enabled: !!playlist.id,
            staleTime: 7_200_000 // 2 hours
        }
    );

    const onExpand = () => {
        drawerRef.current && drawerRef.current.focus();
    };
    const onClick = () => {
        setIsExpanded(!isExpanded);
    };

    function trimDateTime(dateTimeString) {
        const tIndex = dateTimeString.indexOf('T');

        if (tIndex !== -1) {
            return dateTimeString.substring(0, tIndex);
        } else {
            return dateTimeString;
        }
    }

    return (
        <ListItem onClick={onClick} aria-expanded={isExpanded}>
            <div className="d-flex m-1">
                <span>
                    {playlist.attributes.name} {' '}
                </span>
                <span className="ms-auto">
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
                </span>
            </div>
            <div>
                <Drawer position="bottom" isExpanded={isExpanded} onExpand={onExpand}>
                    <DrawerContent panelContent={<></>}>
                        <DrawerContentBody>
                            <DrawerPanelContent>
                                <DrawerHead>
                                    <span tabIndex={isExpanded ? 0 : -1} ref={drawerRef}>
                                        {isTrackLoading ? (
                                            <div className="d-flex justify-content-center">
                                                <Spinner/>
                                            </div>
                                        ) : (
                                            <TrackList tracks={tracks.data}/>
                                        )}
                                    </span>
                                </DrawerHead>
                            </DrawerPanelContent>
                        </DrawerContentBody>
                    </DrawerContent>
                </Drawer>
            </div>
        </ListItem>
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
