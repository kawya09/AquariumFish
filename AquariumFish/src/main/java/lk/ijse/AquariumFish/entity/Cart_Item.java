package lk.ijse.AquariumFish.entity;

import jakarta.persistence.*;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cart_Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer quantity;
    private Double unitPrice;

    @Enumerated(EnumType.STRING)
    private Cart_ItemStatus status;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    private Cart cart;

    @ManyToOne
    @JoinColumn(name = "fish_id")
    private Fish fish;
}