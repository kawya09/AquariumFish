package lk.ijse.AquariumFish.entity;

import jakarta.persistence.*;
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

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order orders;
}