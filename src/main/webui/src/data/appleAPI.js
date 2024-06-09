export const fetchGreeting = async () => {
    const response = await fetch('/greeting');
    if (!response.ok) {
        throw new Error('Failed to fetch greeting');
    }
    return response.text();
};

// Fetch all the library playlists in alphabetical order.
export const fetchLibraryPlaylists = async () => {
    return fetchData('/api/apple/fetchLibraryPlaylists');
};

// Fetch a library playlist’s relationship by using its identifier.
export const fetchLibraryPlaylistRelationByName = async (id, relation) => {
    return fetchData(`/api/apple/fetchLibraryPlaylistRelationByName/${String(id)}/${relation}`);
}

// Fetch one or more songs by using their International Standard Recording Code (ISRC) values.
export const fetchMultipleCatalogSongsByISRC = async (isrc) => {
    return fetchData(`/api/apple/fetchMultipleCatalogSongsByISRC?isrc=${isrc}`);
}

// Create a new playlist in a user’s library.
export const createLibraryPlaylist = async (name, description, isPublic, tracks) => {

    const body = {
        attributes: {
            name: name,
            isPublic: isPublic,
            description: description
        }
    }

    const url = 'https://api.music.apple.com/v1/me/library/playlists'

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem("DT")}`,
            'Music-User-Token': sessionStorage.getItem("MUT")
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const playlist = await response.json();

    await addTracksToLibraryPlaylist(playlist.data[0].id, tracks);

    return playlist.data[0];
}

// A request to add tracks to a library playlist.
export const addTracksToLibraryPlaylist = async (playlistId, tracks) => {

    const tracksData = tracks.map(track => ({
        id: track.data[0].id,
        type: "songs"
    }));

    const url = `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`

    const body = {
        data: tracksData
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem("DT")}`,
            'Music-User-Token': sessionStorage.getItem("MUT")
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

const fetchData = async (url) => {

    var developerToken = sessionStorage.getItem("DT")
    var musicUserToken = sessionStorage.getItem("MUT")

    if (!developerToken) {
        throw new Error('Developer Token not found');
    }
    if (!musicUserToken) {
        throw new Error('Music User Token (MUT) not found');
    }

    const headers = {
        'Authorization': `Bearer ${developerToken}`,
        'Music-User-Token': musicUserToken
    };

    const response = await fetch(url, {
        headers
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return response.json();
};