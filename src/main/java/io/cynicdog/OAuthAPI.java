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

    public OAuthAPI(Vertx vertx,  String host, int port, String CLIENT_ID, String CLIENT_SECRET, String redirectUri) {

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

            WebClient.create(ctx.vertx())
                    .postAbs("https://accounts.spotify.com/api/token")
                    .putHeader("Content-Type", "application/x-www-form-urlencoded")
                    .putHeader("Authorization", "Basic " + encodeBase64(CLIENT_ID + ":" + CLIENT_SECRET))
                    .sendForm(MultiMap.caseInsensitiveMultiMap()
                            .set("code", code)
                            .set("redirect_uri", redirectUri)
                            .set("grant_type", AUTH_CODE.getGrantType()), ar -> {
                        if (ar.failed()) {
                            ctx.response()
                                    .putHeader("Location", "/#error=invalid_token")
                                    .setStatusCode(302)
                                    .end();
                        } else {
                            var body = ar.result().bodyAsJsonObject();
                            var accessToken = body.getString("access_token");
                            var refreshToken = body.getString("refresh_token");

                            WebClient.create(ctx.vertx())
                                    .getAbs("https://api.spotify.com/v1/me")
                                    .putHeader("Authorization", "Bearer " + accessToken)
                                    .send(meResponse -> {
                                        if (meResponse.succeeded()) {

                                            var meResponseBody = meResponse.result().bodyAsJsonObject();

                                            WebClient.create(ctx.vertx())
                                                    .post(port, host, "/user/sign-in?type=spotify")
                                                    .sendJsonObject(new JsonObject()
                                                            .put("stationId", meResponseBody.getString("id"))
                                                            .put("stationName", meResponseBody.getString("display_name")));

                                            logger.info(meResponse.result().bodyAsJsonObject().encodePrettily());

                                            var spotifyUsername = meResponseBody.getString("display_name");
                                            var spotifyProfileImages = meResponseBody.getJsonArray("images");
                                            String spotifyProfilePicture = null;

                                            if (spotifyProfileImages != null && !spotifyProfileImages.isEmpty()) {
                                                spotifyProfilePicture = spotifyProfileImages.getJsonObject(0).getString("url");
                                            }

                                            ctx.response()
                                                    .setStatusCode(302)
                                                    .putHeader("Location", "/")
                                                    .addCookie(Cookie.cookie(
                                                            "access_token", accessToken)
                                                    )
                                                    .addCookie(Cookie.cookie(
                                                            "spotify_username", spotifyUsername.replaceAll("\\s", "_"))
                                                    )
                                                    .addCookie(Cookie.cookie(
                                                            "spotify_profile_picture", spotifyProfilePicture)
                                                    )
                                                    .end();
                                        } else {
                                            logger.info(meResponse.cause().getMessage());
                                        }
                                    });
                        }
                    });
        }
    }
}
