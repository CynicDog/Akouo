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

function RecentlyPlayed() {
    const [isExpanded, setIsExpanded] = React.useState(false);

    const onToggle = (_event, isExpanded) => {
        setIsExpanded(isExpanded);
    };

    const {data: recentlyPlayedTracks = [], isLoading: isRecentlyPlayedLoading} = useQuery(
        'recentlyPlayedTracks',
        () => fetchRecentlyPlayedTracks(
            sessionStorage.getItem("DT"),
            sessionStorage.getItem("MUT")),
        {enabled: !!sessionStorage.getItem("MUT")}
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
                <CardTitle className="row fw-lighter">
                    <div className="col-lg-8 fw-light">
                        {track.attributes.name} {' '}
                        <Label isCompact textMaxWidth="200px">
                            {track.attributes.genreNames.join(", ")}
                        </Label>
                    </div>
                    <div className="col-lg-4">
                        <div className="d-flex justify-content-end">
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
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
        </Card>
    );
};

export default RecentlyPlayed;
