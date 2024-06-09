package io.cynicdog;

import io.cynicdog.API.SpotifyAPI;
import io.vertx.core.Vertx;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.BodyHandler;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;


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

        router.route().handler(BodyHandler.create());

        var spotifyAPI = new SpotifyAPI(vertx, host, port, CLIENT_ID, CLIENT_SECRET, redirectUri);

        router.get("/login").handler(spotifyAPI::login);
        router.get("/callback").handler(spotifyAPI::callback);
        router.get("/getCurrentUserPlaylists").handler(spotifyAPI::getCurrentUserPlaylists);
        router.get("/getPlaylist/:playlistId").handler(spotifyAPI::getPlaylist);
        router.get("/searchForItem").handler(spotifyAPI::searchForItem);
        router.get("/getPlaylistItem/:playlistId/:type").handler(spotifyAPI::getPlaylistItem);
        router.post("/createPlaylist").handler(spotifyAPI::createPlaylist);

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
