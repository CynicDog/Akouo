// Get a list of the playlists owned or followed by the current Spotify user.
export const getCurrentUserPlaylists = async () => {
    return fetchData( `https://api.spotify.com/v1/me/playlists`);
};

export const getPlaylist = async (playlistId) => {
    return fetchData(`https://api.spotify.com/v1/playlists/${playlistId}`);
}

// Search tracks by ISRC code
export const searchForItem = async (isrc) => {
    return fetchData(`https://api.spotify.com/v1/search?type=track&q=isrc%3A${isrc}&limit=1`);
}

// Create a playlist for a Spotify user
export const createPlaylist = async (userId, name, description, isPublic, tracks) => {

    var accessToken = sessionStorage.getItem("ACCESS_TOKEN");

    const url = `https://api.spotify.com/v1/users/${String(userId)}/playlists`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };

    const body = JSON.stringify({
        "name": name,
        "description": description,
        "public": isPublic
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
    });

    if (!response.ok) {
        throw new Error(`Failed to create playlist: ${response.statusText}`);
    }

    const playlist = await response.json();
    const playlistId = playlist.id;

    await addTracksToPlaylist(playlistId, tracks);

    return playlist;
}

// Add one or more items to a user's playlist.
export const addTracksToPlaylist = async (playlistId, tracks) => {

    var accessToken = sessionStorage.getItem("ACCESS_TOKEN");

    const url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    };

    const body = JSON.stringify({
        "uris": tracks.flatMap(track => track.tracks.items.map(item => item.uri))
    });

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
    });

    if (!response.ok) {
        throw new Error(`Failed to add tracks to playlist: ${response.statusText}`);
    }

    return response.json();
};


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