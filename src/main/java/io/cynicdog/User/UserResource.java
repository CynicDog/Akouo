package io.cynicdog.User;

import io.cynicdog.util.Type;
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
    public String signIn(@QueryParam("type") String type,  Map<String, String> payload) {

        User user = userRepository.findByStationId(payload.get("stationId"));

        if (user == null) {

            user = new User(payload.get("stationId"), payload.get("stationName"));

            user.setCreatedAt(LocalDateTime.now());
            user.addSignInHistory(LocalDateTime.now());
            user.setType(Type.valueOf(type.toUpperCase()));

            userRepository.save(user);
        } else {
            user.addSignInHistory(LocalDateTime.now());
            userRepository.update(user);
        }

        return user.getStationName();
    }
}