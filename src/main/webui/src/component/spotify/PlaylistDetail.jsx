import React from "react";

const PlaylistDetail = ({playlist, height = 400}) => {

    console.log(parseSpotifyURI(playlist.uri));

    function parseSpotifyURI(spotifyURI) {
        const parts = spotifyURI.split(':');
        const type = parts[1];
        const id = parts[2];
        return `https://open.spotify.com/embed/${type}/${id}?utm_source=oembed`;
    }

    return (
        <div className="m-3">
            <iframe
                width="100%"
                height={height}
                title="Spotify Embed: My Path to Spotify: Women in Engineering"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                src={parseSpotifyURI(playlist.uri)}/>
        </div>
    );
}

export default PlaylistDetail;