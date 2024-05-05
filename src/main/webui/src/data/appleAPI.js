export const fetchGreeting = async () => {
    const response = await fetch('/greeting');
    if (!response.ok) {
        throw new Error('Failed to fetch greeting');
    }
    return response.text();
};

export const fetchHouses = async (detailed = false) => {
    const queryParams = detailed ? '?detailed=true' : '';
    const response = await fetch(`/houses${queryParams}`);
    if (!response.ok) {
        throw new Error('Failed to fetch houses');
    }
    return response.json();
};

// Fetch all the library songs in alphabetical order.
export const fetchSongs = async (developerToken, musicUserToken) => {
    const url = 'https://api.music.apple.com/v1/me/library/songs?l=en';
    return fetchData(url, developerToken, musicUserToken);
};

// Fetch the resources in heavy rotation for the user.
export const fetchHeavyRotation = async (developerToken, musicUserToken) => {
    const url = 'https://api.music.apple.com/v1/me/history/heavy-rotation?l=en';
    return fetchData(url, developerToken, musicUserToken);
};

// Fetch the recently played tracks for the user.
export const fetchRecentlyPlayedTracks = async (developerToken, musicUserToken) => {
    const url = 'https://api.music.apple.com/v1/me/recent/played/tracks?l=en';
    return fetchData(url, developerToken, musicUserToken);
};

// Fetch all the catalog playlists in alphabetical order
export const fetchChartsPlaylists = async (developerToken, musicUserToken) => {
    const url = 'https://api.music.apple.com/v1/catalog/us/playlists?filter[storefront-chart]=us';
    return fetchData(url, developerToken, musicUserToken);
};

// Fetch the current user’s personal Apple Music station.
export const fetchMyStation = async (developerToken, musicUserToken) => {
    const url = 'https://api.music.apple.com/v1/catalog/kr/stations?filter[identity]=personal';
    return fetchData(url, developerToken, musicUserToken);
};

// Fetch all the library albums in alphabetical order.
export const fetchLibraryAlbums = async (developerToken, musicUserToken) => {
    const url = 'https://api.music.apple.com/v1/me/library/albums?limit=10';
    return fetchData(url, developerToken, musicUserToken);
};

// Fetch a library album’s relationship by using its identifier.
export const fetchLibraryAlbumRelationByName = async (developerToken, musicUserToken, id, relation) => {
    const url = `https://api.music.apple.com/v1/me/library/albums/${String(id)}/${relation}`;
    return fetchData(url, developerToken, musicUserToken);
};

export const fetchLibraryPlaylists = async (developerToken, musicUserToken) => {
    const url = 'https://api.music.apple.com/v1/me/library/playlists';
    return fetchData(url, developerToken, musicUserToken);
};

export const fetchLibraryPlaylistRelationByName = async (developerToken, musicUserToken, id, relation) => {
    const url = `https://api.music.apple.com/v1/me/library/playlists/${String(id)}/${relation}`;
    return fetchData(url, developerToken, musicUserToken);
}

export const fetchRecommendations = async (developerToken, musicUserToken) => {
    const url = 'https://api.music.apple.com/v1/me/recommendations';
    return fetchData(url, developerToken, musicUserToken);
};

const fetchData = async (url, developerToken, musicUserToken) => {
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