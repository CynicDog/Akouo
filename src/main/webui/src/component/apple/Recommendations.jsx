import React, {useState} from 'react';
import {useQuery} from 'react-query';
import {
    fetchRecommendations,
    fetchCatalogAlbumRelationByName,
    fetchCatalogPlaylistRelationByName
} from '../../data/appleAPI.js';
import {
    Spinner,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    Label,
    ExpandableSection,
    CardExpandableContent,
    Popover, TextContent, Text, TextVariants
} from '@patternfly/react-core';

function Recommendations() {
    const [isExpanded, setIsExpanded] = useState(false);
    const onToggle = (_event, isExpanded) => {
        setIsExpanded(isExpanded);
    };

    const {data: recommendations = [], isLoading: isRecommendationLoading} = useQuery(
        'recommendations',
        () => fetchRecommendations(),
        {enabled: !!sessionStorage.getItem("MUT")}
    );

    return (
        <>
            {isRecommendationLoading ? (
                <div className="d-flex justify-content-center">
                    <Spinner/>
                </div>
            ) : (
                <div className="my-3">
                    <ExpandableSection
                        toggleContent={
                            <>
                                <span className="fw-lighter">
                                    Recommendations
                                </span>{' '}
                            </>
                        }
                        displaySize="lg"
                        onToggle={onToggle}
                        isExpanded={isExpanded}>
                        {recommendations.data.map(rcm => (
                            <RecommendationCard key={rcm.id} recommendation={rcm}/>
                        ))}
                    </ExpandableSection>
                </div>
            )}
        </>
    );
}

const RecommendationCard = ({recommendation}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState(null);

    const onToggle = () => {
        setIsExpanded(prevExpanded => !prevExpanded);
    };

    const fetchAndDisplayTracks = async (rlt) => {
        setSelectedArtwork(rlt);
    };

    return (
        <Card key={recommendation.id} id={recommendation.id} isExpanded={isExpanded}>
            <CardHeader id={recommendation.id} onExpand={onToggle}>
                <CardTitle>
                    {recommendation.attributes.title.stringForDisplay}{' '}
                </CardTitle>
            </CardHeader>
            <CardExpandableContent>
                <CardBody style={{overflowX: 'auto', margin: '15px'}}>
                    <div style={{display: 'flex', flexDirection: 'row', gap: '10px', flexWrap: 'nowrap'}}>
                        {recommendation.relationships.contents.data.map((relation, index) => (
                            <div key={index} style={{width: '250px', flexShrink: 0}}>
                                <Popover
                                    headerContent={
                                        <>
                                            <span className="mx-1">
                                                {relation.attributes.name}
                                            </span>
                                            <Label isCompact>
                                                {relation.type}
                                            </Label>
                                        </>
                                    }
                                    bodyContent={
                                        <TrackListPopoverContent relation={relation} />
                                    }
                                >
                                    <>
                                        {relation.type === 'playlists' && (
                                            <apple-music-artwork-lockup type="playlist" content-id={relation.id} width="250"/>
                                        )}
                                        {relation.type === 'albums' && (
                                            <apple-music-artwork-lockup type="album" content-id={relation.id} width="250"/>
                                        )}
                                        {relation.type ==='stations' && (
                                            <apple-music-artwork source={relation.attributes.artwork.url} width="250"/>
                                        )}
                                    </>
                                </Popover>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </CardExpandableContent>
        </Card>
    );
};

const TrackListPopoverContent = ({relation}) => {
    const {data: tracks, isLoading, isError} = useQuery(
        ['tracks', relation.id, relation.type],
        async () => {
            if (relation.type === 'albums') {
                return fetchCatalogAlbumRelationByName(relation.id, 'tracks');
            } else if (relation.type === 'playlists') {
                return fetchCatalogPlaylistRelationByName(relation.id, 'tracks');
            }
        }
    );

    if (isError) return <div>Error fetching tracks</div>;

    return (
        <>
            {relation.attributes.description && (
                <TextContent>
                    <Text component={TextVariants.blockquote}>
                        <div>{relation.attributes.description.standard}</div>
                    </Text>
                </TextContent>
            )}
            {isLoading ? (
                <div className="d-flex justify-content-center">
                    <Spinner/>
                </div>
            ) : (
                <div style={{maxHeight: '150px', overflowY: 'auto'}} className="">
                    {tracks && tracks.data.map((track, idx) => (
                        <div key={idx} className="fw-lighter">{track.attributes.name}</div>
                    ))}
                </div>
            )}
        </>
    );
};


export default Recommendations;
