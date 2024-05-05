package io.cynicdog.User;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import java.util.List;

@ApplicationScoped
public class UserRepository {

    @Inject
    EntityManager em;

    public List<User> findAll() {
        var query = em.createQuery("SELECT u FROM User u", User.class);
        return query.getResultList();
    }

    public User findByMusicUserToken(String musicUserToken) {
        return em.find(User.class, musicUserToken);
    }

    public void save(User user) {
        em.persist(user);
    }

    public void update(User user) {
        em.merge(user);
    }
}
