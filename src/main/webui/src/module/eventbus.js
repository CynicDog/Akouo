import EventBus from 'vertx3-eventbus-client';

const eventbus = new EventBus("/eventbus");
eventbus.enableReconnect(true);

export const registerHandler = (eventTopic , callback) => {
    eventbus.registerHandler(eventTopic, callback);
};

export default eventbus;