package lk.ijse.AquariumFish.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admin {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String adminName;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}