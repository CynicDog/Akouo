import {useQuery} from "react-query";
import {getCurrentUserPlaylists} from "../../data/spotifyAPI.js";

const Playlists = () => {

    const {data: spotifyPlaylists = [], isLoading: isSpotifyPlaylistLoading} = useQuery(
        'spotifyPlaylists',
        () => getCurrentUserPlaylists(sessionStorage.getItem("ACCESS_TOKEN")),
        {enabled: !!sessionStorage.getItem("ACCESS_TOKEN")}
    );

    return (
        <></>
    );
}

export default Playlists;