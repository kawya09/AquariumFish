package lk.ijse.AquariumFish.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Order_ItemDTO {
    private Long id;
    private Integer quantity;
    private Double unitPrice;
    private Double subtotal;
}
