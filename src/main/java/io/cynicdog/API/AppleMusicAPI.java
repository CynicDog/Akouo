package io.cynicdog.API;

import io.cynicdog.util.CircuitBreakerService;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.WebClient;
import io.vertx.ext.web.codec.BodyCodec;
import org.jboss.logging.Logger;

import jakarta.inject.Inject;

public class AppleMusicAPI {

    static final Logger logger = Logger.getLogger(AppleMusicAPI.class);

    final Vertx vertx;
    final CircuitBreakerService circuitBreakerService;
    final String developerToken;

    @Inject
    public AppleMusicAPI(Vertx vertx, CircuitBreakerService circuitBreakerService, String developerToken) {
        this.vertx = vertx;
        this.circuitBreakerService = circuitBreakerService;
        this.developerToken = developerToken;
    }

    private void fetchData(RoutingContext ctx, String remoteUrl, String musicUserToken) {
        WebClient client = WebClient.create(vertx);
        CircuitBreaker circuitBreaker = circuitBreakerService.getCircuitBreaker("apple-music");

        circuitBreaker.executeSupplier(() -> {
            return client.getAbs(remoteUrl)
                    .putHeader("Authorization", "Bearer " + developerToken)
                    .putHeader("Music-User-Token", musicUserToken)
                    .as(BodyCodec.jsonObject())
                    .send()
                    .map(response -> response.body())
                    .toCompletionStage();
        }).whenComplete((response, throwable) -> {
            if (throwable != null) {
                ctx.response()
                        .setStatusCode(500)
                        .end(new JsonObject().put("error", throwable.getMessage()).encode());
            } else {
                ctx.response()
                        .putHeader("Content-Type", "application/json")
                        .end(response.encode());
            }
        });
    }

    private String validateAccessToken(RoutingContext ctx) {
        String musicUserToken = ctx.request().getHeader("Music-User-Token");

        if (musicUserToken == null) {
            ctx.response()
                    .setStatusCode(401)
                    .end(new JsonObject().put("error", "Music User Token not found or invalid").encode());
            return null;
        }

        return musicUserToken;
    }

    public void fetchLibraryPlaylists(RoutingContext ctx) {
        var musicUserToken = validateAccessToken(ctx);
        if (musicUserToken == null) return;

        fetchData(ctx, "https://api.music.apple.com/v1/me/library/playlists?l=en", musicUserToken);
    }

    public void fetchLibraryPlaylistRelationByName(RoutingContext ctx) {
        var musicUserToken = validateAccessToken(ctx);
        if (musicUserToken == null) return;

        String id = ctx.pathParam("id");
        String relation = ctx.pathParam("relation");
        if (id == null || relation == null) {
            ctx.response()
                    .setStatusCode(400)
                    .end(new JsonObject().put("error", "Album ID and Relation are required").encode());
            return;
        }

        String fetchUrl = "https://api.music.apple.com/v1/me/library/playlists/" + id + "/" + relation + "?include=catalog";
        fetchData(ctx, fetchUrl, musicUserToken);
    }

    public void fetchMultipleCatalogSongsByISRC(RoutingContext ctx) {
        var musicUserToken = validateAccessToken(ctx);
        if (musicUserToken == null) return;

        String isrc = ctx.queryParam("isrc").stream().findFirst().orElse(null);
        if (isrc == null) {
            ctx.response()
                    .setStatusCode(400)
                    .end(new JsonObject().put("error", "ISRC is required").encode());
            return;
        }

        String fetchUrl = "https://api.music.apple.com/v1/catalog/kr/songs?filter[isrc]=" + isrc;
        fetchData(ctx, fetchUrl, musicUserToken);
    }

    public void createLibraryPlaylist(RoutingContext ctx) {
        var musicUserToken = validateAccessToken(ctx);
        if (musicUserToken == null) return;

        JsonObject requestBody = ctx.body().asJsonObject().getJsonObject("attributes");
        String name = requestBody.getString("name");
        String description = requestBody.getString("description");
        boolean isPublic = requestBody.getBoolean("isPublic");

        JsonArray data = ctx.body().asJsonObject().getJsonArray("data");

        if (name == null) {
            ctx.response()
                    .setStatusCode(400)
                    .end(new JsonObject().put("error", "Name is required").encode());
            return;
        }

        WebClient client = WebClient.create(vertx);

        JsonObject body = new JsonObject()
                .put("attributes", new JsonObject()
                        .put("name", name)
                        .put("description", description)
                        .put("public", isPublic)
                );

        CircuitBreaker circuitBreaker = circuitBreakerService.getCircuitBreaker("apple-music");

        circuitBreaker.executeSupplier(() -> {
            return client.postAbs("https://api.music.apple.com/v1/me/library/playlists")
                    .putHeader("Authorization", "Bearer " + developerToken)
                    .putHeader("Music-User-Token", musicUserToken)
                    .putHeader("Content-Type", "application/json")
                    .sendJsonObject(body)
                    .map(response -> response.bodyAsJsonObject())
                    .toCompletionStage();
        }).whenComplete((playlist, throwable) -> {
            if (throwable != null) {
                ctx.response()
                        .setStatusCode(500)
                        .end(new JsonObject().put("error", throwable.getMessage()).encode());
            } else {
                String playlistId = playlist.getJsonArray("data").getJsonObject(0).getString("id");
                addTracksToLibraryPlaylist(ctx, client, musicUserToken, playlistId, data, playlist);
            }
        });
    }

    public void addTracksToLibraryPlaylist(RoutingContext ctx, WebClient client, String musicUserToken, String playlistId, JsonArray data, JsonObject playlist) {
        String url = "https://api.music.apple.com/v1/me/library/playlists/" + playlistId + "/tracks";
        JsonObject body = new JsonObject()
                .put("data", data);

        CircuitBreaker circuitBreaker = circuitBreakerService.getCircuitBreaker("apple-music");

        circuitBreaker.executeSupplier(() -> {
            return client.postAbs(url)
                    .putHeader("Authorization", "Bearer " + developerToken)
                    .putHeader("Music-User-Token", musicUserToken)
                    .putHeader("Content-Type", "application/json")
                    .sendJsonObject(body)
                    .map(response -> response.bodyAsJsonObject())
                    .toCompletionStage();
        }).whenComplete((result, throwable) -> {
            if (throwable != null) {
                ctx.response()
                        .setStatusCode(500)
                        .end(new JsonObject().put("error", throwable.getMessage()).encode());
            } else {
                ctx.response()
                        .setStatusCode(200)
                        .end(playlist.encode());
            }
        });
    }
}