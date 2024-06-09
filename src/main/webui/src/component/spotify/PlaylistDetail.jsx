import React from "react";
import {useAuth} from "../../Context.jsx";
import {Label, List, ListItem, Spinner, Tooltip} from "@patternfly/react-core";
import SearchModal from "../SearchModal.jsx";
import AppleIcon from "../../../public/apple.jsx";
import {useQuery} from "react-query";
import {getPlaylistItem} from "../../data/spotifyAPI.js";

const PlaylistDetail = ({playlist, height = 400, fromModal = false}) => {

    const {isAppleAuthenticated} = useAuth();

    function parseSpotifyURI(spotifyURI) {
        const parts = spotifyURI.split(':');
        const type = parts[1];
        const id = parts[2];
        return `https://open.spotify.com/embed/${type}/${id}?utm_source=oembed`;
    }

    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const handleModalToggle = _event => {
        setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
    };
    const handleWizardToggle = () => {
        setIsModalOpen(prevIsModalOpen => !prevIsModalOpen);
    };

    const {data: tracks, isLoading: isTrackLoading} = useQuery(
        ['spotifyPlaylistTracks', playlist.id],
        () => getPlaylistItem(playlist.id, 'tracks'),
        {
            enabled: !!playlist.id,
            staleTime: 7_200_000 // 2 hours
        }
    );

    return (
        <div className="m-3">
            {isTrackLoading ? (
                <div className="d-flex justify-content-center">
                    <Spinner/>
                </div>
            ) : (
            <List isPlain isBordered style={{height: '250px', overflowY: 'auto'}}>
                {tracks.items.map((track, index) => (
                    <ListItem className="fw-lighter" key={index}>
                        <div className="fw-light">
                            {track.track.name} {' '}
                            <Tooltip content={<div>{track.track.artists[0].name}</div>}>
                                <Label textMaxWidth="100px" isCompact>
                                    {track.track.artists[0].name}
                                </Label>
                            </Tooltip>{' '}
                            <Tooltip content={<div>{track.track.album.name}</div>}>
                                <Label isCompact textMaxWidth="100px" color="blue">
                                    {track.track.album.name}
                                </Label>
                            </Tooltip>
                        </div>
                    </ListItem>
                ))}
            </List>
            )}
            {isAppleAuthenticated && !isTrackLoading && !fromModal && (
                <div>
                    <div className="d-flex">
                        <div className="ms-auto">
                            <Label
                                icon={<AppleIcon />}
                                variant="outline"
                                onClick={() => handleModalToggle()}
                                className="mt-5">
                                Find in Apple Music
                            </Label>
                        </div>
                        <SearchModal
                            targetService={"apple"}
                            playlist={playlist}
                            tracks={tracks.items}
                            isModalOpen={isModalOpen}
                            handleModalToggle={handleModalToggle}
                            handleWizardToggle={handleWizardToggle}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlaylistDetail;