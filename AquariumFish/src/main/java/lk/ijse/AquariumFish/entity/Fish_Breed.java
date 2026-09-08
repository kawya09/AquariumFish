package lk.ijse.AquariumFish.entity;

import jakarta.persistence.*;
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

    @OneToMany(mappedBy = "breed")
    private List<Fish> fishes;
}