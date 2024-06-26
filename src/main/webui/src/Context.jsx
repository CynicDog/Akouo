import {createContext, useContext, useEffect, useState} from "react";
import {
    getSpotifyAccessTokenFromCookie,
    getSpotifyProfilePictureFromCookie, getSpotifyUserIdFromCookie,
    getSpotifyUsernameFromCookie,
    removeSpotifyAccessTokenCookie,
    removeSpotifyProfilePictureCooke,
    removeSpotifyUserIdCookie,
    removeSpotifyUsernameCookie
} from "./module/cookie.js";

// Theme Provider
const ThemeContext = createContext();

export const ThemeProvider = ({children}) => {
    const [theme, setTheme] = useState('light');

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
}
export const useTheme = () => useContext(ThemeContext);


// Auth Provider
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAppleAuthenticated, setIsAppleAuthenticated] = useState(false);
    const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(null);
    const [musicInstance, setMusicInstance] = useState(null);
    const [appleUsername, setAppleUsername] = useState(null);
    const [spotifyUsername, setSpotifyUsername] = useState(null);
    const [spotifyUserId, setSpotifyUserId] = useState(null);
    const [spotifyProfilePicture, setSpotifyProfilePicture] = useState(null);

    useEffect(() => {

        const spotifyAccessToken = getSpotifyAccessTokenFromCookie();
        if (spotifyAccessToken !== null) {
            sessionStorage.setItem("ACCESS_TOKEN", spotifyAccessToken);
            setIsSpotifyAuthenticated(true);
        }

        const spotifyUsername = getSpotifyUsernameFromCookie();
        if (spotifyUsername !== null) {
            setSpotifyUsername(spotifyUsername);
        }

        const spotifyUserId = getSpotifyUserIdFromCookie();
        if (spotifyUserId !== null) {
            setSpotifyUserId(spotifyUserId);
        }

        const spotifyProfilePicture = getSpotifyProfilePictureFromCookie();
        if (spotifyProfilePicture !== null) {
            setSpotifyProfilePicture(spotifyProfilePicture);
        }

        configureMusicKit();
    }, []);

    const configureMusicKit = async () => {
        try {
            const MusicKit = window.MusicKit;
            await MusicKit.configure({
                developerToken: import.meta.env.VITE_APPLE_DEVELOPER_TOKEN,
                app: {
                    name: 'Akouo',
                    build: '2024.4.22',
                },
            });
            const music = MusicKit.getInstance();
            setMusicInstance(music);

            if (sessionStorage.getItem("MUT") === null || !music.isAuthorized) {
                setIsAppleAuthenticated(false);
            } else {
                setIsAppleAuthenticated(true);
                setAppleUsername(sessionStorage.getItem("APPLE_USERNAME"));
            }
        } catch (error) {
            console.error('Error configuring MusicKit:', error);
        }
    };

    const handleAppleSignIn = async () => {
        if (musicInstance) {
            try {
                const response = await musicInstance.authorize();
                sessionStorage.setItem("MUT", response);

                var storefront = await fetch('https://api.music.apple.com/v1/me/storefront', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_APPLE_DEVELOPER_TOKEN}`,
                        'Music-User-Token': response
                    }})
                    .then(response => {
                        return response.json();
                    });

                var station =  await musicInstance.api.music(`/v1/catalog/${storefront.data[0].id}/stations`, {
                    'filter[identity]': 'personal',
                });
                
                var stationId = station.data.data[0].id
                var stationName = station.data.data[0].attributes.name

                fetch("/user/sign-in?type=apple", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'stationId': stationId,
                        'stationName': stationName
                    })
                })
                    .then(response => response.text())
                    .then(data => {
                        setAppleUsername(data);
                        sessionStorage.setItem("APPLE_USERNAME", data);
                    })
                    .catch(error => console.error('Error:', error));

                setIsAppleAuthenticated(true);
            } catch (error) {
                console.error('Error authorizing with Apple Music:', error);
            }
        }
    };

    const handleAppleSignOut = async () => {
        if (musicInstance) {
            try {
                await musicInstance.unauthorize();
                setIsAppleAuthenticated(false);
                setAppleUsername(null);
            } catch (error) {
                console.error('Error signing out from Apple Music:', error);
            }
        }
        sessionStorage.removeItem('MUT');
    };

    const handleSpotifySignOut = () => {

        removeSpotifyAccessTokenCookie();
        removeSpotifyUsernameCookie();
        removeSpotifyUserIdCookie();
        removeSpotifyProfilePictureCooke();

        sessionStorage.removeItem("ACCESS_TOKEN");

        setIsSpotifyAuthenticated(null);
        setSpotifyUsername(null);
        setSpotifyProfilePicture(null);
    };

    const value = {
        isAppleAuthenticated,
        isSpotifyAuthenticated,
        musicInstance,
        appleUsername,
        spotifyUsername,
        spotifyUserId,
        spotifyProfilePicture,
        handleAppleSignIn,
        handleAppleSignOut,
        handleSpotifySignOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => useContext(AuthContext);