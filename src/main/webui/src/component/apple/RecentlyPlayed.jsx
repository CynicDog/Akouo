import React from 'react';
import {useQuery} from 'react-query';
import {fetchRecentlyPlayedTracks} from '../../data/appleAPI.js';
import {
    Spinner,
    Card,
    CardHeader,
    CardTitle,
    Tooltip,
    ExpandableSection,
    Label
} from '@patternfly/react-core';

function RecentlyPlayed({developerToken, musicUserToken}) {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const onToggle = (_event, isExpanded) => {
        setIsExpanded(isExpanded);
    };

    const {data: recentlyPlayedTracks = [], isLoading: isRecentlyPlayedLoading} = useQuery(
        'recentlyPlayedTracks',
        () => fetchRecentlyPlayedTracks(developerToken, musicUserToken),
        {enabled: !!musicUserToken}
    );

    return (
        <>
            {isRecentlyPlayedLoading ? (
                <div className="d-flex justify-content-center">
                    <Spinner/>
                </div>
            ) : (
                <div className="my-3">
                    <ExpandableSection
                        toggleContent={
                            <>
                                <span className="fw-lighter">Recently Played Tracks</span>{' '}
                            </>
                        }
                        displaySize="lg"
                        onToggle={onToggle}
                        isExpanded={isExpanded}
                    >
                        {recentlyPlayedTracks.data.map((track, index) => (
                            <TrackCard key={index} track={track}/>
                        ))}
                    </ExpandableSection>
                </div>
            )}
        </>
    );
}

const TrackCard = ({track}) => {
    return (
        <Card id={track.id}>
            <CardHeader>
                <CardTitle className="d-flex fw-lighter">
                    <span className="fw-light">
                        {track.attributes.name} {' '}
                        <Label isCompact textMaxWidth="200px">
                            {track.attributes.genreNames.join(", ")}
                        </Label>
                    </span>
                    <span className="ms-auto">
                        <Tooltip content={<div>{track.attributes.artistName}</div>}>
                            <Label isCompact textMaxWidth="100px">
                                {track.attributes.artistName}
                            </Label>
                        </Tooltip> {' '}
                        <Tooltip content={<div>{track.attributes.albumName}</div>}>
                            <Label isCompact textMaxWidth="100px" color="blue">
                                {track.attributes.albumName}
                            </Label>
                        </Tooltip>
                    </span>
                </CardTitle>
            </CardHeader>
        </Card>
    );
};

export default RecentlyPlayed;
