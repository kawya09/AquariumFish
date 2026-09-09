package lk.ijse.AquariumFish.dto;

import lk.ijse.AquariumFish.enumaration.UserStatus;
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
    private UserStatus status;
}
