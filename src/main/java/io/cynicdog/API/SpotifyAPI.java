package io.cynicdog.API;

import io.vertx.core.Vertx;
import org.jboss.logging.Logger;

public class SpotifyAPI {

    static final Logger logger = Logger.getLogger(SpotifyAPI.class);
    final Vertx vertx;

    public SpotifyAPI(Vertx vertx) {
        this.vertx = vertx;
    }
}
