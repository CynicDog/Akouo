import {useQuery} from "react-query";
import {getCurrentUserPlaylists} from "../../data/spotifyAPI.js";
import {Spinner} from "@patternfly/react-core";
import React from "react";

const Playlists = () => {

    const {data: spotifyPlaylists = [], isLoading: isSpotifyPlaylistLoading} = useQuery(
        'spotifyPlaylists',
        () => getCurrentUserPlaylists(sessionStorage.getItem("ACCESS_TOKEN")),
        {enabled: !!sessionStorage.getItem("ACCESS_TOKEN")}
    );

    function parseSpotifyURI(spotifyURI) {
        const parts = spotifyURI.split(':');
        const type = parts[1];
        const id = parts[2];
        return `https://open.spotify.com/embed/${type}/${id}?utm_source=oembed`;
    }

    return (
        <>
            {isSpotifyPlaylistLoading ? (
                <div className="d-flex justify-content-center">
                    <Spinner/>
                </div>
            ) : (
                <div className="m-3">
                    {spotifyPlaylists.items.map((playlist, index) => (
                        <iframe
                            width="100%"
                            height="152"
                            title="Spotify Embed: My Path to Spotify: Women in Engineering"
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            src={parseSpotifyURI(playlist.uri)}/>
                    ))}
                </div>
            )}
        </>
    );
}

export default Playlists;