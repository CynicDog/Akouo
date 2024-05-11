package io.cynicdog.util;

import io.vertx.core.MultiMap;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.client.WebClient;

import java.util.concurrent.CompletableFuture;

import static io.cynicdog.util.SecureStringUtil.encodeBase64;
import static io.vertx.ext.auth.oauth2.OAuth2FlowType.AUTH_CODE;

public class OAuthClientUtil {

    public static CompletableFuture<JsonObject> getSpotifyAccessToken(WebClient client, String code, String CLIENT_ID, String CLIENT_SECRET, String redirectUri) {

        CompletableFuture<JsonObject> tokenFuture = new CompletableFuture<>();

        client.postAbs("https://accounts.spotify.com/api/token")
                .putHeader("Content-Type", "application/x-www-form-urlencoded")
                .putHeader("Authorization", "Basic " + encodeBase64(CLIENT_ID + ":" + CLIENT_SECRET))
                .sendForm(MultiMap.caseInsensitiveMultiMap()
                        .set("code", code)
                        .set("redirect_uri", redirectUri)
                        .set("grant_type", AUTH_CODE.getGrantType()), ar -> {
                    if (ar.succeeded()) {
                        tokenFuture.complete(ar.result().bodyAsJsonObject());
                    } else {
                        tokenFuture.completeExceptionally(ar.cause());
                    }
                });

        return tokenFuture;
    }

    public static CompletableFuture<JsonObject> getSpotifyMeInfo(WebClient client, String accessToken) {

        CompletableFuture<JsonObject> userInfoFuture = new CompletableFuture<>();

        client.getAbs("https://api.spotify.com/v1/me")
                .putHeader("Authorization", "Bearer " + accessToken)
                .send(ar -> {
                    if (ar.succeeded()) {
                        userInfoFuture.complete(ar.result().bodyAsJsonObject());
                    } else {
                        userInfoFuture.completeExceptionally(ar.cause());
                    }
                });

        return userInfoFuture;
    }
}
