package lk.ijse.AquariumFish.entity;

import jakarta.persistence.*;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fish_Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String categoryName;
    private String description;

    @Enumerated(EnumType.STRING)
    private Fish_CategoryStatus status;

    @OneToMany(mappedBy = "category")
    private List<Fish> fishes;
}