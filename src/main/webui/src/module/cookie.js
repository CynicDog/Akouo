export const getSpotifyAccessTokenFromCookie = () => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('access_token='));
    if (cookie) {
        return cookie.split('=')[1];
    }
    return null;
};

export const getSpotifyUsernameFromCookie = () => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('spotify_username='));
    if (cookie) {

        return cookie
            .split('=')[1]
            .replace(/_/g, ' ');
    }
    return null;
};

export const getSpotifyProfilePictureFromCookie = () => {
    const cookie = document.cookie.split('; ').find(row => row.startsWith('spotify_profile_picture='));
    if (cookie) {
        return cookie.split('=')[1];
    }
    return null;
};

export const removeSpotifyAccessTokenCookie = () => {
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

export const removeSpotifyUsernameCookie = () => {
    document.cookie = 'spotify_username=;';
};

export const removeSpotifyProfilePictureCooke = () => {
    document.cookie = 'spotify_profile_picture=;';
}