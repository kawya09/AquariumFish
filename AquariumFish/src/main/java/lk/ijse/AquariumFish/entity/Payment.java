package lk.ijse.AquariumFish.entity;

import jakarta.persistence.*;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String paymentMethod;
    private LocalDateTime paymentDate;
    private Double amount;
    private String paymentStatus;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order orders;
}