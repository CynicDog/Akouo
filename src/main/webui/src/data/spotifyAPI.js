// Get a list of the playlists owned or followed by the current Spotify user.
export const getCurrentUserPlaylists = async (accessToken) => {
    const url = `https://api.spotify.com/v1/me/playlists`;
    return fetchData(url, accessToken);
};

export const searchForItem = async (accessToken, isrc, trackName, albumName, artistName, releaseDate, genreNames) => {

    // Encode track name and artist name
    const encodedTrackName = encodeURIComponent(trackName);
    const encodedAlbumName = encodeURIComponent(albumName);
    const encodedArtistName = encodeURIComponent(artistName);
    const parsedYear = new Date(releaseDate).getFullYear();

    // Construct the search query with filters and encoded parameters
    const searchQuery = `remaster%2520isrc%3A${isrc}%2520album%3A${encodedAlbumName}%2520track%3A${encodedTrackName}%2520artist%3A${encodedArtistName}%2520year%3A${parsedYear}%2520genre:%3A${genreNames}`;

    // Construct the URL with the search query
    const url = `https://api.spotify.com/v1/search?q=${searchQuery}&type=track&limit=1`;

    // Fetch data using the constructed URL
    return fetchData(url, accessToken);
}

const fetchData = async (url, accessToken) => {
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