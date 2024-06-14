package io.cynicdog;

import io.cynicdog.API.AppleMusicAPI;
import io.cynicdog.API.SpotifyAPI;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.handler.BodyHandler;
import io.vertx.redis.client.Redis;
import io.vertx.redis.client.RedisAPI;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.Arrays;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;


@ApplicationScoped
public class RouterRegistry {

    static final Logger logger = Logger.getLogger(RouterRegistry.class);

    @Inject
    Vertx vertx;

    @Inject
    Redis redisClient;

    public void register(@Observes Router router,
                         @ConfigProperty(name = "apple.developer.token") String developerToken,
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

        router.get("/greeting").handler(ctx ->
                ctx.response().end("Welcome to Akouo 🎶 <br/ > Your gateway to a seamless journey of music exploration and connection!")
        );

        router.route().handler(BodyHandler.create());

        var spotifyAPI = new SpotifyAPI(vertx, host, port, CLIENT_ID, CLIENT_SECRET, redirectUri);
        var appleMusicAPI = new AppleMusicAPI(vertx, developerToken);

        router.get("/login").handler(spotifyAPI::login);
        router.get("/callback").handler(spotifyAPI::callback);

        // Spotify API endpoints
        var spotifySubRouter = Router.router(vertx);
        router.route("/api/spotify/*").subRouter(spotifySubRouter);

        spotifySubRouter.get("/getCurrentUserPlaylists").handler(spotifyAPI::getCurrentUserPlaylists);
        spotifySubRouter.get("/getPlaylist/:playlistId").handler(spotifyAPI::getPlaylist);
        spotifySubRouter.get("/searchForItem")
                .handler(this::rateLimiter)
                .handler(spotifyAPI::searchForItem);
        spotifySubRouter.get("/getPlaylistItem/:playlistId/:type").handler(spotifyAPI::getPlaylistItem);
        spotifySubRouter.post("/createPlaylist").handler(spotifyAPI::createPlaylist);

        // Apple Music API endpoints
        var appleMusicRouter = Router.router(vertx);
        router.route("/api/apple/*").subRouter(appleMusicRouter);

        appleMusicRouter.get("/fetchLibraryPlaylists").handler(appleMusicAPI::fetchLibraryPlaylists);
        appleMusicRouter.get("/fetchLibraryPlaylistRelationByName/:id/:relation").handler(appleMusicAPI::fetchLibraryPlaylistRelationByName);
        appleMusicRouter.get("/fetchMultipleCatalogSongsByISRC")
                .handler(this::rateLimiter)
                .handler(appleMusicAPI::fetchMultipleCatalogSongsByISRC);
        appleMusicRouter.post("/createLibraryPlaylist").handler(appleMusicAPI::createLibraryPlaylist);

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

    private final static int CALL_PER_MN = 600;
    private final Map<String, String> minuteKeys = new ConcurrentHashMap<>();

    private void rateLimiter(RoutingContext rc) {

        RedisAPI redis = RedisAPI.api(redisClient);

        long currentTime = System.currentTimeMillis();
        String currentMinute = Long.toString(currentTime / 60000); // milliseconds to minutes
        String minuteKey = minuteKeys.computeIfAbsent(currentMinute, k -> "ratelimit:" + UUID.randomUUID().toString() + ":mn");

        redis.zremrangebyscore(minuteKey, "0", Long.toString(currentTime - 60000))
                .onComplete(remResult -> {
                    if (remResult.succeeded()) {
                        redis.zadd(Arrays.asList(minuteKey, Long.toString(currentTime), currentTime + ":1"))
                                .onComplete(zaddResult -> {
                                    if (zaddResult.succeeded()) {
                                        redis.expire(Arrays.asList(minuteKey, "61"), expireResult -> {
                                            if (expireResult.succeeded()) {
                                                redis.zrange(Arrays.asList(minuteKey, "0", "-1"))
                                                        .onSuccess(res -> {
                                                            int totalNbOfEntries = res.size();
                                                            if (totalNbOfEntries > CALL_PER_MN) {
                                                                rc.response()
                                                                        .putHeader("X-MINUTES-REMAINED-CALL", "-1")
                                                                        .putHeader("content-type", "application/json; charset=utf-8")
                                                                        .setStatusCode(429)
                                                                        .end(new JsonObject()
                                                                                .put("message", "You have reached the max number of calls per minute (" + CALL_PER_MN + ")")
                                                                                .encodePrettily());
                                                            } else {
                                                                rc.response()
                                                                        .putHeader("X-MINUTES-REMAINED-CALL", Integer.toString(CALL_PER_MN - totalNbOfEntries));
                                                                rc.next();
                                                            }
                                                        })
                                                        .onFailure(err -> rc.fail(503, err));
                                            } else {
                                                rc.fail(503, expireResult.cause());
                                            }
                                        });
                                    } else {
                                        rc.fail(503, zaddResult.cause());
                                    }
                                });
                    } else {
                        rc.fail(503, remResult.cause());
                    }
                });
    }
}
