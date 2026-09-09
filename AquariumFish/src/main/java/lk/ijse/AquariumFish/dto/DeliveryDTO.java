package lk.ijse.AquariumFish.dto;

import lk.ijse.AquariumFish.enumaration.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryDTO {
    private Long id;
    private String deliveryAddress;
    private LocalDateTime deliveryDate;
    private String deliveryStatus;
    private String trackingNo;
    private DeliveryStatus status;
}
