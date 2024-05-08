import Playlists from "./Playlists.jsx";
import Recommendations from "./Recommendations.jsx";
import RecentlyPlayed from "./RecentlyPlayed.jsx";
import React from "react";

const AppleComponentsArea = () => {


    return (
        <>
            <Playlists />
            <Recommendations />
            <RecentlyPlayed />
        </>
    )
}

export default AppleComponentsArea;