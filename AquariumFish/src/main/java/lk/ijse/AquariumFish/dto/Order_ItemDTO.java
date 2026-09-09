package lk.ijse.AquariumFish.dto;

import lk.ijse.AquariumFish.enumaration.UserStatus;
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
    private Oder_ItemStatus status;
}
