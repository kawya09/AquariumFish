package lk.ijse.AquariumFish.entity;

import jakarta.persistence.*;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fish_Breed {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String breedName;
    private String description;

    @Enumerated(EnumType.STRING)
    private Fish_BreedStatus status;

    @OneToMany(mappedBy = "breed")
    private List<Fish> fishes;
}