package lk.ijse.AquariumFish.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentDTO {
    private Long id;
    private String paymentMethod;
    private LocalDateTime paymentDate;
    private Double amount;
    private  paymentStatus status;
}
