import {
    Button, Label, List, ListComponent, ListItem,
    Modal,
    ModalVariant, OrderType,
    SimpleList,
    SimpleListItem, Tooltip,
    Wizard,
    WizardHeader,
    WizardStep
} from "@patternfly/react-core";
import React, {useState} from "react";
import SearchedTracks from "./SearchedTracks.jsx";

const SearchModal = ({tracks, isModalOpen, handleModalToggle, handleWizardToggle}) => {

    const [searchResults, setSearchResults] = useState([]);

    return (
        <>
            <Modal
                variant={ModalVariant.large}
                showClose={false}
                isOpen={isModalOpen}
                onClose={handleModalToggle}
                hasNoBodyWrapper>
                <Wizard
                    height={400}
                    header={
                        <WizardHeader
                            title="Find in Spotify"
                            titleId="modal-wizard-label"
                            description="Find tracks of your Apple Music playlist in Spotify!"
                            onClose={handleWizardToggle}
                            closeButtonAriaLabel="Close wizard" />
                    }
                    onClose={handleWizardToggle}>
                    <WizardStep
                        id="with-wizard-step-1"
                        name="Validate Apple Music Tracks">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="fs-5 fw-lighter">Apple Music Tracks</div>
                                <List component={ListComponent.ol} type={OrderType.number}>
                                    {tracks.map((track, index) => (
                                        <ListItem key={index}>
                                            {track.attributes.name}{' '}
                                            <Tooltip content={<div>{track.attributes.albumName}</div>}>
                                                <Label isCompact textMaxWidth="7ch">
                                                    {track.attributes.albumName}
                                                </Label>
                                            </Tooltip>{' '}
                                            <Tooltip content={<div>{track.attributes.artistName}</div>}>
                                                <Label isCompact textMaxWidth="7ch">
                                                    {track.attributes.artistName}
                                                </Label>
                                            </Tooltip>
                                        </ListItem>
                                    ))}
                                </List>
                            </div>
                            <div className="col-lg-6">
                                <div className="fs-5 fw-lighter">Searched Tracks in Spotify</div>
                                <SearchedTracks tracks={tracks} setSearchResults={setSearchResults}/>
                            </div>
                        </div>
                    </WizardStep>
                    <WizardStep
                        id="with-wizard-step-3"
                        name="Create Spotify Playlist"
                        footer={{
                            nextButtonText: 'Finish',
                            onNext: handleWizardToggle
                        }} >
                        Create Spotify Playlist
                    </WizardStep>
                </Wizard>
            </Modal>
        </>
    )
}

export default SearchModal;