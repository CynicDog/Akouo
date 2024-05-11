package io.cynicdog.User;

import io.cynicdog.util.Type;
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

    private LocalDateTime createdAt;

    @ElementCollection
    @CollectionTable(
            name = "user_sign_in",
            joinColumns = @JoinColumn(name = "station_id")
    )
    @Column(name = "sign_in_at")
    private List<LocalDateTime> signInHistory = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private Type type;

    public User() {
    }

    public User(String stationId, String stationName) {
        this.stationId = stationId;
        this.stationName = stationName;
    }

    public String getStationId() {
        return stationId;
    }

    public void setStationId(String musicUserToken) {
        this.stationId = musicUserToken;
    }

    public String getStationName() {
        return stationName;
    }

    public void setStationName(String stationName) {
        this.stationName = stationName;
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

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }
}