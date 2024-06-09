package io.cynicdog;

import io.cynicdog.API.OAuthAPI;
import io.vertx.core.Vertx;
import io.vertx.ext.bridge.PermittedOptions;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.sockjs.SockJSBridgeOptions;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.concurrent.atomic.AtomicInteger;


@ApplicationScoped
public class RouterRegistry {

    @Inject
    Vertx vertx;

    static final Logger logger = Logger.getLogger(RouterRegistry.class);

    public void register (@Observes Router router,
                          @ConfigProperty(name = "spotify.client-id") String CLIENT_ID,
                          @ConfigProperty(name = "spotify.client-secret") String CLIENT_SECRET,
                          @ConfigProperty(name = "spotify.redirect-uri") String redirectUri,
                          @ConfigProperty(name = "host") String host,
                          @ConfigProperty(name = "port") int port) {

        // register logger
        router.route().handler(ctx -> {
            logger.info("Request URI: " + ctx.request().uri());
            ctx.next();
        });

        var OAuthAPI = new OAuthAPI(vertx, host, port, CLIENT_ID, CLIENT_SECRET, redirectUri);

        router.get("/login").handler(OAuthAPI::login);
        router.get("/callback").handler(OAuthAPI::callback);

        router.get("/greeting").handler(ctx ->
                ctx.response().end("Welcome to Akouo 🎶 <br/ > Your gateway to a seamless journey of music exploration and connection!")
        );


//        router.route("/eventbus/*").subRouter(
//                SockJSHandler.create(vertx).bridge(new SockJSBridgeOptions()
//                        .addInboundPermitted(new PermittedOptions().setAddressRegex("EB.*"))
//                        .addOutboundPermitted(new PermittedOptions().setAddressRegex("EB.*")))
//        );
//
//        AtomicInteger counter = new AtomicInteger();
//        vertx.setPeriodic(3000,
//                ignored -> vertx.eventBus().publish("EB.ticks", counter.getAndIncrement()));
    }
}
