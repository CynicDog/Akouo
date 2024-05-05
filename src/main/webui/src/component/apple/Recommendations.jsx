import React from 'react';
import {useQuery} from 'react-query';
import {fetchRecommendations} from '../../data/appleAPI.js';
import {
    Spinner,
    Card,
    CardBody,
    CardHeader,
    CardTitle,
    List,
    ListItem,
    Tooltip,
    Label,
    Badge, ExpandableSection, CardExpandableContent, Popover
} from '@patternfly/react-core';

function Recommendations({developerToken, musicUserToken}) {

    const [isExpanded, setIsExpanded] = React.useState(false);
    const onToggle = (_event, isExpanded) => {
        setIsExpanded(isExpanded);
    };

    const {data: recommendations = [], isLoading: isRecommendationLoading} = useQuery(
        'recommendations',
        () => fetchRecommendations(developerToken, musicUserToken),
        {enabled: !!musicUserToken}
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
                                </span> {' '}
                            </>
                        }
                        displaySize="lg"
                        onToggle={onToggle}
                        isExpanded={isExpanded}>
                        {recommendations.data.map(rcm => (
                            <RecommendationCard
                                key={rcm.id}
                                recommendation={rcm}
                                developerToken={developerToken}
                                musicUserToken={musicUserToken}/>
                        ))}
                    </ExpandableSection>
                </div>
            )}
        </>
    );
}

const RecommendationCard = ({recommendation, developerToken, musicUserToken}) => {

    const [isExpanded, setIsExpanded] = React.useState(false);
    const onToggle = () => {
        setIsExpanded(prevExpanded => !prevExpanded);
    };

    return (
        <Card key={recommendation.id} id={recommendation.id} isExpanded={isExpanded}>
            <CardHeader id={recommendation.id} onExpand={onToggle}>
                <CardTitle>
                    {recommendation.attributes.title.stringForDisplay} {' '}
                </CardTitle>
            </CardHeader>
            <CardExpandableContent>
                <CardBody style={{overflowX: 'auto', margin: '15px'}}>
                    <div style={{display: 'flex', flexDirection: 'row', gap: '10px', flexWrap: 'nowrap'}}>
                        {recommendation.relationships.contents.data.map((rlt, index) => (
                            <div key={index} style={{width: '250px', flexShrink: 0}}>
                                <Popover
                                    headerContent={
                                        <>
                                            <span className="mx-1">
                                                {rlt.attributes.name}
                                            </span>
                                            <Label isCompact>
                                                {rlt.type}
                                            </Label>
                                        </>
                                    }
                                    bodyContent={
                                        <div>
                                            {rlt.attributes.description?.standard}
                                        </div>
                                    }
                                >
                                    <a>
                                        <apple-music-artwork source={rlt.attributes.artwork.url} width="250"/>
                                    </a>
                                </Popover>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </CardExpandableContent>
        </Card>
    )
}

export default Recommendations;

