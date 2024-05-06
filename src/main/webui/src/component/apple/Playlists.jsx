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
    DrawerHead,
    DrawerPanelContent, Drawer, DrawerContent, DrawerContentBody
} from '@patternfly/react-core';
import {useAuth} from "../../Context.jsx";

function Playlists() {

    const [isExpanded, setIsExpanded] = React.useState(false);
    const onToggle = (_event, isExpanded) => {
        setIsExpanded(isExpanded);
    };

    const {data: applePlaylists = [], isLoading: isApplePlaylistLoading} = useQuery(
        'applePlaylists',
        () => fetchLibraryPlaylists(
            sessionStorage.getItem("DT"),
            sessionStorage.getItem("MUT")),
        {enabled: !!sessionStorage.getItem("MUT")}
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
                                />
                            ))}
                        </List>
                    </ExpandableSection>
                </div>
            )}
        </>
    );
}

const PlaylistCard = ({playlist}) => {

    const { musicInstance } = useAuth();

    const [isExpanded, setIsExpanded] = React.useState(false);
    const drawerRef = React.useRef();

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
        <ListItem aria-expanded={isExpanded}>
            <div className="d-flex">
                <Label variant="outline" onClick={() => onClick()}>
                    {playlist.attributes.name}
                </Label>
                <span className="ms-auto">
                    <Label isCompact color="blue" onClick={async () => {
                        await musicInstance.setQueue({playlist: playlist.id, startPlaying: true});
                    }}>
                        play
                    </Label>{' '}
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
                                        <PlaylistDetail playlist={playlist} />
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

const PlaylistDetail = ({playlist}) => {

    const {data: tracks, isLoading: isTrackLoading} = useQuery(
        ['playlistTracks', playlist.id],
        () => fetchLibraryPlaylistRelationByName(
            sessionStorage.getItem("DT"),
            sessionStorage.getItem("MUT"),
            playlist.id,
            'tracks'),
        {
            enabled: !!playlist.id,
            staleTime: 7_200_000 // 2 hours
        }
    );

    return (
        <>
            {isTrackLoading ? (
                <div className="d-flex justify-content-center">
                    <Spinner/>
                </div>
            ) : (
                <List isPlain isBordered>
                    {tracks.data.map((track, index) => (
                        <ListItem className="row fw-lighter" key={index}>
                            <div className="col-lg-8 fw-light">
                                {track.attributes.name} {' '}
                                <Label isCompact>
                                    {track.attributes.genreNames.join(",")}
                                </Label>
                            </div>
                            <div className="col-lg-4">
                                <div className="d-flex justify-content-end">
                                    <Tooltip content={<div>{track.attributes.artistName}</div>}>
                                    <Label textMaxWidth="100px" isCompact>
                                        {track.attributes.artistName}
                                    </Label>
                                    </Tooltip>
                                    <Tooltip content={<div>{track.attributes.albumName}</div>}>
                                        <Label isCompact textMaxWidth="100px" color="blue">
                                            {track.attributes.albumName}
                                        </Label>
                                    </Tooltip>
                                </div>
                            </div>
                        </ListItem>
                    ))}
                </List>
            )}
        </>
    );
};

export default Playlists;
