package io.cynicdog;

import io.vertx.core.MultiMap;
import io.vertx.core.Vertx;
import io.vertx.core.http.Cookie;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.oauth2.OAuth2Auth;
import io.vertx.ext.auth.oauth2.OAuth2AuthorizationURL;
import io.vertx.ext.auth.oauth2.OAuth2Options;
import io.vertx.ext.web.RoutingContext;
import io.vertx.ext.web.client.WebClient;
import org.jboss.logging.Logger;

import java.util.Arrays;
import java.util.concurrent.CompletableFuture;

import static io.cynicdog.util.SecureStringUtil.encodeBase64;
import static io.cynicdog.util.SecureStringUtil.generateRandomString;
import static io.vertx.ext.auth.oauth2.OAuth2FlowType.AUTH_CODE;

public class OAuthAPI {

    static final Logger logger = Logger.getLogger(OAuthAPI.class);
    public static String stateKey = "STATE";

    final Vertx vertx;
    final String host;
    final int port;

    final String CLIENT_ID;
    final String CLIENT_SECRET;
    final String redirectUri;
    final OAuth2Options credentials;

    public OAuthAPI(Vertx vertx, String host, int port, String CLIENT_ID, String CLIENT_SECRET, String redirectUri) {

        this.vertx = vertx;
        this.host = host;
        this.port = port;

        this.CLIENT_ID = CLIENT_ID;
        this.CLIENT_SECRET = CLIENT_SECRET;
        this.redirectUri = redirectUri;
        this.credentials = new OAuth2Options()
                .setFlow(AUTH_CODE)
                .setSite("https://accounts.spotify.com/")
                .setAuthorizationPath("/authorize")
                .setTokenPath("/api/token")
                .setClientId(CLIENT_ID)
                .setClientSecret(CLIENT_SECRET);
    }

    public void login(RoutingContext ctx) {

        OAuth2Auth oauth2Provider = OAuth2Auth.create(vertx, credentials);

        String state = generateRandomString(16);
        String authorization_uri = oauth2Provider.authorizeURL(
                new OAuth2AuthorizationURL()
                        .setRedirectUri(redirectUri)
                        .setScopes(Arrays.asList("user-read-private", "user-read-email", "playlist-read-private"))
                        .setState(state));

        ctx.response()
                .addCookie(Cookie.cookie(stateKey, state))
                .putHeader("Location", authorization_uri)
                .setStatusCode(302).end();
    }

    public void callback(RoutingContext ctx) {
        var code = ctx.request().getParam("code");
        var state = ctx.request().getParam("state");
        var storedState = ctx.request().getCookie(stateKey).getValue();

        if (state.isEmpty() || !state.equals(storedState)) {
            ctx.response()
                    .putHeader("Location", "/#state_mismatch")
                    .setStatusCode(302)
                    .end();
        } else {
            ctx.response().removeCookie(stateKey);

            WebClient client = WebClient.create(ctx.vertx());

            var tokenFuture = getSpotifyAccessToken(client, code);
            tokenFuture
                    .thenAccept(result -> handleTokenSuccess(ctx, client, result))
                    .exceptionally(ex -> handleTokenFailure(ctx, ex));
        }
    }

    private CompletableFuture<JsonObject> getSpotifyAccessToken(WebClient client, String code) {

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

    private CompletableFuture<JsonObject> getSpotifyMeInfo(WebClient client, String accessToken) {

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

    private void handleTokenSuccess(RoutingContext ctx, WebClient client, JsonObject tokenResponse) {
        var accessToken = tokenResponse.getString("access_token");
        var refreshToken = tokenResponse.getString("refresh_token");

        var userInfoFuture = getSpotifyMeInfo(client, accessToken);
        userInfoFuture.thenAccept(userInfo -> {

            var spotifyStationId = userInfo.getString("id");
            var spotifyUsername = userInfo.getString("display_name");
            var spotifyProfileImages = userInfo.getJsonArray("images");
            String spotifyProfilePicture = null;

            if (spotifyProfileImages != null && !spotifyProfileImages.isEmpty()) {
                spotifyProfilePicture = spotifyProfileImages.getJsonObject(0).getString("url");
            }

            // internal request to populate sign-in histories
            WebClient.create(ctx.vertx())
                    .post(port, host, "/user/sign-in?type=spotify")
                    .sendJsonObject(new JsonObject()
                            .put("stationId", spotifyStationId)
                            .put("stationName", spotifyUsername));

            logger.info(userInfo.encodePrettily());

            ctx.response()
                    .setStatusCode(302)
                    .putHeader("Location", "/")
                    .addCookie(Cookie.cookie("access_token", accessToken))
                    .addCookie(Cookie.cookie("spotify_username", spotifyUsername.replaceAll("\\s", "_")))
                    .addCookie(Cookie.cookie("spotify_profile_picture", spotifyProfilePicture))
                    .end();

        }).exceptionally(ex -> {
            logger.info("Failed to fetch user info: " + ex.getMessage());
            ctx.response()
                    .putHeader("Location", "/#error=user_info_failed")
                    .setStatusCode(302)
                    .end();

            return null;
        });
    }

    private Void handleTokenFailure(RoutingContext ctx, Throwable ex) {
        ctx.response()
                .putHeader("Location", "/#error=invalid_token")
                .setStatusCode(302)
                .end();

        return null;
    }
}