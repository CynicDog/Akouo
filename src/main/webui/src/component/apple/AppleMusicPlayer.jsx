import React, {useState} from "react";
import {useAuth, useTheme} from "../../Context.jsx";

const AppleMusicPlayer = () => {

    const {theme} = useTheme();
    const {isAppleAuthenticated} = useAuth();

    const [isCardPlayerOpen, setIsCardPlayerOpen] = useState(true);

    const toggleCardPlayer = () => {
        setIsCardPlayerOpen((prevState) => !prevState);
    };

    return (
        <>
            {isAppleAuthenticated && (
                <>
                    <div id="card-toggler" className={isCardPlayerOpen ? '' : 'hidden'} onClick={toggleCardPlayer}>
                        {isCardPlayerOpen ? <span className='fw-lighter'>hide card player</span> : <a>🎧</a>}
                    </div>
                    {isCardPlayerOpen && (
                        <apple-music-card-player theme={theme}/>
                    )}
                </>
            )}
        </>
    )
}

export default AppleMusicPlayer;