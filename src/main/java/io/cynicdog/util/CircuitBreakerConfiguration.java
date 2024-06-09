package io.cynicdog.util;

import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;

import java.time.Duration;

@ApplicationScoped
public class CircuitBreakerConfiguration {

    @Produces
    @ApplicationScoped
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        return CircuitBreakerRegistry.of(configurationCircuitBreaker());
    }

    private CircuitBreakerConfig configurationCircuitBreaker() {
        return CircuitBreakerConfig.custom()
                .failureRateThreshold(50)
                .waitDurationInOpenState(Duration.ofMillis(7000)) // 7 seconds
                .permittedNumberOfCallsInHalfOpenState(3)
                .slidingWindowSize(10)
                .recordExceptions(RuntimeException.class)
                .build();
    }
}
