package io.cynicdog.util;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CircuitBreakerService {

    private static final Logger logger = Logger.getLogger(CircuitBreakerService.class);

    @Inject
    CircuitBreakerRegistry circuitBreakerRegistry;

    private CircuitBreaker circuitBreaker;

    public synchronized CircuitBreaker getCircuitBreaker(String entryName) {
        if (circuitBreaker == null) {
            addRegistryEvent();
            circuitBreaker = circuitBreakerRegistry.circuitBreaker(entryName);

            // TODO: failure recognition
            circuitBreaker.getEventPublisher()
                    .onSuccess(event -> logger.info("Success call"))
                    .onError(event -> logger.error("Failed call"))
                    .onIgnoredError(event -> logger.info("Ignored exception occurred"))
                    .onReset(event -> logger.info("State is reset"))
                    .onStateTransition(event -> logger.info("State transition: " + event.getStateTransition()));
        }
        return circuitBreaker;
    }

    private void addRegistryEvent() {
        circuitBreakerRegistry.getEventPublisher()
                .onEntryAdded(entryAddedEvent -> {
                    CircuitBreaker addedEntry = entryAddedEvent.getAddedEntry();
                    logger.info("CircuitBreaker " + addedEntry.getName() + " added");
                });
    }
}
