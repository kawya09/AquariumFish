package lk.ijse.AquariumFish.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime orderDate;
    private Double totalAmount;
    private String orderStatus;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @OneToMany(mappedBy = "orders", cascade = CascadeType.ALL)
    private List<Order_Item> orderItems;

    @OneToOne(mappedBy = "orders", cascade = CascadeType.ALL)
    private Payment payment;

    @OneToOne(mappedBy = "orders", cascade = CascadeType.ALL)
    private Delivery delivery;
}