package io.cynicdog.API;

import io.vertx.core.Vertx;
import org.jboss.logging.Logger;

public class AppleMusicAPI {

    static final Logger logger = Logger.getLogger(AppleMusicAPI.class);
    final Vertx vertx;

    public AppleMusicAPI(Vertx vertx) {
        this.vertx = vertx;
    }
}
