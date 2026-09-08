package lk.ijse.AquariumFish.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FishDTO {
    private Long id;
    private String fishName;
    private String description;
    private Double price;
    private Integer stockQty;
}
