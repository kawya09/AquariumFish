package lk.ijse.AquariumFish.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Fish_BreedDTO {
    private Long id;
    private String breedName;
    private String description;
}
