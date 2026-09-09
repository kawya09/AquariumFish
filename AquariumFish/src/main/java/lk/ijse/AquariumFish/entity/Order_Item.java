package lk.ijse.AquariumFish.entity;

import jakarta.persistence.*;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order_Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer quantity;
    private Double unitPrice;
    private Double subtotal;

    @Enumerated(EnumType.STRING)
    private Order_ItemStatus status;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order orders;

    @ManyToOne
    @JoinColumn(name = "fish_id")
    private Fish fish;
}