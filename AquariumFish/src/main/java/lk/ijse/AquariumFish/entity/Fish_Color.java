package lk.ijse.AquariumFish.entity;

import jakarta.persistence.*;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fish_Color {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String colorName;

    @Enumerated(EnumType.STRING)
    private Fish_ColorStatus status;

    @OneToMany(mappedBy = "color")
    private List<Fish> fishes;
}