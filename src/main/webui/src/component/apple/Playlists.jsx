import React, {useRef, useState} from 'react';
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
import SearchModal from "./SearchModal.jsx";
import SpotifyIcon from "../../../public/spotify.jsx";
import {useAuth} from "../../Context.jsx";

function Playlists() {

    const [isExpanded, setIsExpanded] = useState(false);
    const onToggle = (_event, isExpanded) => {
        setIsExpanded(isExpanded);
    };

    const {data: applePlaylists = [], isLoading: isApplePlaylistLoading} = useQuery(
        'applePlaylists',
        () => fetchLibraryPlaylists(),
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

    const [isExpanded, setIsExpanded] = useState(false);
    const drawerRef = useRef();

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
                <Label variant="outline" onClick={() => onClick()} className="m-2">
                    {playlist.attributes.name}
                </Label>
                <span className="ms-auto my-2">
                    <Label isCompact>
                        {trimDateTime(playlist.attributes.dateAdded)}
                    </Label>
                </span>
            </div>
            <div>
                <Drawer position="bottom" isExpanded={isExpanded} onExpand={onExpand}>
                    <DrawerContent panelContent={<></>}>
                        <DrawerContentBody>
                            <DrawerPanelContent className="m-2">
                                <DrawerHead>
                                    <span tabIndex={isExpanded ? 0 : -1} ref={drawerRef}>
                                        <PlaylistDetail playlist={playlist}/>
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

    const {isSpotifyAuthenticated} = useAuth();

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const handleModalToggle = _event => {
        setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
    };
    const handleWizardToggle = () => {
        setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
    };

    const {data: tracks, isLoading: isTrackLoading} = useQuery(
        ['applePlaylistTracks', playlist.id],
        () => fetchLibraryPlaylistRelationByName(playlist.id, 'tracks'),
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
                <>
                    <div className="row">
                        <div className="col-lg-4">
                            <apple-music-artwork-lockup type="playlist"
                                                        content-id={playlist.attributes.playParams.globalId}
                                                        width="250"/>
                        </div>
                        <div className="col-lg-8">
                            <List isPlain isBordered style={{height: '250px', overflowY: 'auto'}}>
                                {tracks.data.map((track, index) => (
                                    <ListItem className="fw-lighter" key={index}>
                                        <div className="fw-light">
                                            {track.attributes.name} {' '}
                                            <Label isCompact>
                                                {track.attributes.genreNames.join(",")}
                                            </Label>{' '}
                                            <Tooltip content={<div>{track.attributes.artistName}</div>}>
                                                <Label textMaxWidth="100px" isCompact>
                                                    {track.attributes.artistName}
                                                </Label>
                                            </Tooltip>{' '}
                                            <Tooltip content={<div>{track.attributes.albumName}</div>}>
                                                <Label isCompact textMaxWidth="100px" color="blue">
                                                    {track.attributes.albumName}
                                                </Label>
                                            </Tooltip>
                                        </div>
                                    </ListItem>
                                ))}
                            </List>
                        </div>
                    </div>
                    {isSpotifyAuthenticated && (
                        <div className="d-flex">
                            <div className="ms-auto">
                                <Label
                                    icon={<SpotifyIcon />}
                                    variant="outline"
                                    onClick={() => handleModalToggle()}
                                    className="mt-5">
                                    Find in Spotify
                                </Label>
                            </div>
                            <SearchModal
                                targetService={"spotify"}
                                playlist={playlist}
                                tracks={tracks.data}
                                isModalOpen={isModalOpen}
                                handleModalToggle={handleModalToggle}
                                handleWizardToggle={handleWizardToggle}
                            />
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default Playlists;
