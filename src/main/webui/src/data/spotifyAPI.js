// Get a list of the playlists owned or followed by the current Spotify user.
export const getCurrentUserPlaylists = async () => {
    return fetchData( `/getCurrentUserPlaylists`);
};

export const getPlaylist = async (playlistId) => {
    return fetchData(`/getPlaylist/${playlistId}`);
}

// Search tracks by ISRC code
export const searchForItem = async (isrc) => {
    return fetchData(`/searchForItem?isrc=${isrc}`);
}

export const getPlaylistItem = async (playlistId, type) => {
    return fetchData(`/getPlaylistItem/${playlistId}/${type}`)
}

export const createPlaylist = async (userId, name, description, isPublic, tracks) => {

    const accessToken = sessionStorage.getItem("ACCESS_TOKEN");
    const uris = tracks.flatMap(track => track.tracks.items.map(item => item.uri));

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };

    const body = JSON.stringify({
        "userId": userId,
        "name": name,
        "description": description,
        "public": isPublic,
        "uris": uris
    });

    const response = await fetch(`/createPlaylist`, {
        method: 'POST',
        headers: headers,
        body: body,
    });

    if (!response.ok) {
        throw new Error(`Failed to create playlist: ${response.statusText}`);
    }

    const playlist = await response.json();

    return playlist;
}

const fetchData = async (url) => {

    var accessToken = sessionStorage.getItem("ACCESS_TOKEN");

    if (!accessToken) {
        throw new Error('Access Token not found');
    }

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
    };

    const response = await fetch(url, {
        headers
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response.json();
};