package io.cynicdog.User;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Path("/user")
@Produces(MediaType.APPLICATION_JSON)
public class UserResource {

    @Inject
    UserRepository userRepository;

    @GET
    public List<User> findAll() {

        return userRepository.findAll();
    }

    @POST
    @Path("/sign-in")
    @Transactional
    public String signIn(@HeaderParam("STATION_ID") String stationId, Map<String, String> payload) {
        User user = userRepository.findByMusicUserToken(stationId);

        if (user == null) {
            String username = generateUniqueUsername();

            user = new User(stationId, payload.get("stationName"), username);
            user.setCreatedAt(LocalDateTime.now());
            user.addSignInHistory(LocalDateTime.now());

            userRepository.save(user);
        } else {
            user.addSignInHistory(LocalDateTime.now());
            userRepository.update(user);
        }

        return user.getUsername();
    }

    private String generateUniqueUsername() {

        return "USER_" + UUID.randomUUID().toString().substring(0, 8);
    }
}