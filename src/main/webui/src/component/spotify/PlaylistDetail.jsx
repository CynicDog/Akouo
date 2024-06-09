import React from "react";
import {useAuth} from "../../Context.jsx";
import {Label} from "@patternfly/react-core";
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
            <iframe
                width="100%"
                height={height}
                style={{borderRadius: "20px"}}
                title="Spotify Embed: My Path to Spotify: Women in Engineering"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                src={parseSpotifyURI(playlist.uri)}/>
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