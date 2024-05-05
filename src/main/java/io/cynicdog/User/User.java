package io.cynicdog.User;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name="station_id", unique = true, nullable = false)
    private String stationId;

    @Column(name="station_name")
    private String stationName;

    @Column(name = "username")
    private String username;

    private LocalDateTime createdAt;

    @ElementCollection
    @CollectionTable(
            name = "user_sign_in",
            joinColumns = @JoinColumn(name = "station_id")
    )
    @Column(name = "sign_in_at")
    private List<LocalDateTime> signInHistory = new ArrayList<>();

    public User() {
    }

    public User(String stationId, String stationName, String username) {
        this.stationId = stationId;
        this.stationName = stationName;
        this.username = username;
    }

    public String getStationId() {
        return stationId;
    }

    public void setStationId(String musicUserToken) {
        this.stationId = musicUserToken;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void addSignInHistory(LocalDateTime signInAt) {
        this.signInHistory.add(signInAt);
    }

    public List<LocalDateTime> getSignInHistory() {
        return signInHistory;
    }
}
