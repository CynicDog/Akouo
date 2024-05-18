export const fetchGreeting = async () => {
    const response = await fetch('/greeting');
    if (!response.ok) {
        throw new Error('Failed to fetch greeting');
    }
    return response.text();
};

// Fetch all the library songs in alphabetical order.
export const fetchSongs = async () => {
    return fetchData('https://api.music.apple.com/v1/me/library/songs?l=en');
};

// Fetch the resources in heavy rotation for the user.
export const fetchHeavyRotation = async () => {
    return fetchData('https://api.music.apple.com/v1/me/history/heavy-rotation?l=en');
};

// Fetch the recently played tracks for the user.
export const fetchRecentlyPlayedTracks = async () => {
    return fetchData('https://api.music.apple.com/v1/me/recent/played/tracks?l=en');
};

// Fetch all the catalog playlists in alphabetical order
export const fetchChartsPlaylists = async () => {
    return fetchData('https://api.music.apple.com/v1/catalog/us/playlists?filter[storefront-chart]=us');
};

// Fetch the current user’s personal Apple Music station.
export const fetchMyStation = async () => {
    return fetchData('https://api.music.apple.com/v1/catalog/kr/stations?filter[identity]=personal');
};

// Fetch all the library albums in alphabetical order.
export const fetchLibraryAlbums = async () => {
    return fetchData('https://api.music.apple.com/v1/me/library/albums?limit=10');
};

// Fetch a library album’s relationship by using its identifier.
export const fetchLibraryAlbumRelationByName = async (id, relation) => {
    return fetchData(`https://api.music.apple.com/v1/me/library/albums/${String(id)}/${relation}`);
};

// Fetch an album’s relationship by using its identifier.
export const fetchCatalogAlbumRelationByName = async (id, relation) => {
    return fetchData(`https://api.music.apple.com/v1/catalog/kr/albums/${String(id)}/${relation}`);
};

// Fetch all the library playlists in alphabetical order.
export const fetchLibraryPlaylists = async () => {
    return fetchData('https://api.music.apple.com/v1/me/library/playlists?l=en');
};

// Fetch a playlist’s relationship by using its identifier.
export const fetchCatalogPlaylistRelationByName = async (id, relation) => {
    return fetchData(`https://api.music.apple.com/v1/catalog/kr/playlists/${String(id)}/${relation}`);
};

// Fetch a library playlist’s relationship by using its identifier.
export const fetchLibraryPlaylistRelationByName = async (id, relation) => {
    return fetchData(`https://api.music.apple.com/v1/me/library/playlists/${String(id)}/${relation}?include=catalog`);
}

// Fetch default recommendations.
export const fetchRecommendations = async () => {
    return fetchData('https://api.music.apple.com/v1/me/recommendations?l=en');
};

// Fetch one or more songs by using their International Standard Recording Code (ISRC) values.
export const fetchMultipleCatalogSongsByISRC = async (isrc) => {
    return fetchData(`https://api.music.apple.com/v1/catalog/kr/songs?filter[isrc]=${isrc}`);
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