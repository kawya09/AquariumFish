package lk.ijse.AquariumFish.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Delivery {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String deliveryAddress;
    private LocalDateTime deliveryDate;
    private String deliveryStatus;
    private String trackingNo;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order orders;
}