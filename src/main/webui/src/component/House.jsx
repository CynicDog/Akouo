import React from 'react';
import {
    Card,
    CardTitle,
    CardBody,
    CardFooter,
    Label,
    DrawerPanelContent,
    DrawerHead,
    DrawerActions,
    DrawerCloseButton,
    Drawer,
    DrawerContent,
    DrawerContentBody,
    ExpandableSectionVariant, ExpandableSection, Badge, Avatar
} from '@patternfly/react-core';

import male_farmer from '../../public/male-farmer.png';

const House = ({name, users}) => {

    const houseColor = houseColors[name];
    const houseMascot = houseMascots[name];

    const [isPanelExpanded, setIsPanelExpanded] = React.useState(false);
    const drawerRef = React.useRef();
    const onPanelExpand = () => {
        drawerRef.current && drawerRef.current.focus();
    };
    const onPanelClick = () => {
        setIsPanelExpanded(!isPanelExpanded);
    };
    const onPanelCloseClick = () => {
        setIsPanelExpanded(false);
    };
    const panelContent = <DrawerPanelContent widths={{default: 'width_66'}}>
        <DrawerHead>
        <span tabIndex={isPanelExpanded ? 0 : -1} ref={drawerRef}>
            {users.map(user => (
                <Label icon={<Avatar src={male_farmer} size="sm"/>} className="mx-1" color={houseColor}>
                    {user.username}
                </Label>
            ))}
        </span>
            <DrawerActions>
                <DrawerCloseButton onClick={onPanelCloseClick}/>
            </DrawerActions>
        </DrawerHead>
    </DrawerPanelContent>;

    const [isAnnouncementSectionExpanded, setIsAnnouncementSectionExpanded] = React.useState(false);
    const onAnnouncementSectionToggle = (_event, isExpanded) => {
        setIsAnnouncementSectionExpanded(isExpanded);
    };

    return (
        <div className="my-3">
            <Card>
                <CardTitle>
                    <Label color={houseColor} icon={houseMascot} aria-expanded={isPanelExpanded} onClick={onPanelClick}>
                        {name} {' '}
                        <Label isCompact>{users.length}</Label>
                    </Label>
                </CardTitle>
                <CardBody>
                    <Drawer isExpanded={isPanelExpanded} isInline onExpand={onPanelExpand}>
                        <DrawerContent panelContent={panelContent}>
                            <DrawerContentBody>
                                <ExpandableSection
                                    toggleText={'🗣 Announcement'}
                                    onToggle={onAnnouncementSectionToggle}
                                    isExpanded={isAnnouncementSectionExpanded}
                                    isIndented >
                                    <div>
                                        Some announcement ..
                                    </div>
                                </ExpandableSection>
                            </DrawerContentBody>
                        </DrawerContent>
                    </Drawer>
                </CardBody>
                <CardFooter>
                </CardFooter>
            </Card>
        </div>
    );
};

export default House;

const houseColors = {
    Gryffindor: 'red',
    Slytherin: 'green',
    Ravenclaw: 'blue',
    Hufflepuff: 'orange'
};

const houseMascots = {
    Gryffindor: '🦁',
    Slytherin: '🐍',
    Ravenclaw: '🦅',
    Hufflepuff: '🦦'
}