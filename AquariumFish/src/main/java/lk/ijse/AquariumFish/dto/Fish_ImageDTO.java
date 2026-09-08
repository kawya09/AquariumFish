package lk.ijse.AquariumFish.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Fish_ImageDTO {
    private Long id;
    private String imageUrl;
    private Boolean isPrimary;
}
