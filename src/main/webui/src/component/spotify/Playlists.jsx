import {useQuery} from "react-query";
import {getCurrentUserPlaylists} from "../../data/spotifyAPI.js";
import {
    Badge,
    Drawer,
    DrawerContent,
    DrawerContentBody, DrawerHead, DrawerPanelContent,
    ExpandableSection, HelperText, HelperTextItem,
    Label,
    List, ListItem,
    Spinner,
    Tooltip
} from "@patternfly/react-core";
import React from "react";
import PlaylistDetail from "./PlaylistDetail.jsx";

const Playlists = () => {

    const [isExpanded, setIsExpanded] = React.useState(false);
    const onToggle = (_event, isExpanded) => {
        setIsExpanded(isExpanded);
    };


    const {data: spotifyPlaylists = [], isLoading: isSpotifyPlaylistLoading, isError} = useQuery(
        'spotifyPlaylists',
        () => getCurrentUserPlaylists(),
        {
            enabled: !!sessionStorage.getItem("ACCESS_TOKEN",),
            retry: 2,
            retryDelay: 3000, // 3 seconds
        }
    );

    return (
        <>
            {isSpotifyPlaylistLoading ? (
                <div className="d-flex justify-content-center">
                    <Spinner/>
                </div>
            ) : isError ? (
                <HelperText>
                    <HelperTextItem variant="error" hasIcon>
                        An error occurred while fetching search results.
                    </HelperTextItem>
                </HelperText>
            ) : (
                <div className="my-3">
                    <ExpandableSection
                        toggleContent={
                            <>
                                <span className="fw-lighter">
                                    Spotify Playlists
                                </span> {' '}
                                <Badge isRead>
                                    <span className="fw-lighter">
                                        {spotifyPlaylists.total}
                                    </span>
                                </Badge>
                            </>
                        }
                        displaySize="lg"
                        onToggle={onToggle}
                        isExpanded={isExpanded}>
                        <List isPlain isBordered>
                            {spotifyPlaylists.items.map(playlist => (
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

    const [isExpanded, setIsExpanded] = React.useState(false);
    const drawerRef = React.useRef();

    const onExpand = () => {
        drawerRef.current && drawerRef.current.focus();
    };
    const onClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (

        <ListItem aria-expanded={isExpanded}>
            <div className="d-flex">
                <Label variant="outline" onClick={() => onClick()} className="m-2">
                    {playlist.name}
                </Label>
            </div>
            <div>
                <Drawer position="bottom" isExpanded={isExpanded} onExpand={onExpand}>
                    <DrawerContent panelContent={<></>}>
                        <DrawerContentBody>
                            <DrawerPanelContent>
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
}

export default Playlists;