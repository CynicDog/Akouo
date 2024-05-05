import SpotifyIcon from '../../public/spotify.jsx';
import AppleIcon from "../../public/apple.jsx";
import {useAuth} from "../Context.jsx";

const AuthArea = () => {
    const { isAppleAuthenticated, spotifyAccessToken, handleAppleSignIn, handleAppleSignOut, handleSpotifySignOut } = useAuth();

    const appleSignOut = () => {
        handleAppleSignOut();
    }

    const appleSignIn = () => {
        handleAppleSignIn();
    }

    const spotifySignOut = () => {
        handleSpotifySignOut();
    }

    return (
        <div className="d-flex justify-content-end p-3">
            {isAppleAuthenticated ? (
                <div onClick={appleSignOut} className="btn">
                    <AppleIcon/>
                </div>
            ) : (
                <a onClick={appleSignIn} className="btn text-primary link-underline link-underline-opacity-0">
                    <AppleIcon />
                </a>
            )}
            {spotifyAccessToken ? (
                <div onClick={spotifySignOut} className="btn">
                    <SpotifyIcon/>
                </div>
            ) : (
                <a href="/login" className="btn text-primary link-underline link-underline-opacity-0">
                    <SpotifyIcon/>
                </a>
            )}
        </div>
    );
};

export default AuthArea;
