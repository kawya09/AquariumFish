package lk.ijse.AquariumFish.entity;

import jakarta.persistence.*;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lombok.*;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fish {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fishName;
    private String description;
    private Double price;
    private Integer stockQty;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @ManyToOne
    @JoinColumn(name = "seller_id")
    private Seller seller;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Fish_Category category;

    @ManyToOne
    @JoinColumn(name = "breed_id")
    private Fish_Breed breed;

    @ManyToOne
    @JoinColumn(name = "size_id")
    private Fish_Size size;

    @ManyToOne
    @JoinColumn(name = "color_id")
    private Fish_Color color;

    @OneToMany(mappedBy = "fish", cascade = CascadeType.ALL)
    private List<Fish_Image> images;

    @OneToMany(mappedBy = "fish")
    private List<Cart_Item> cartItems;

    @OneToMany(mappedBy = "fish")
    private List<Order_Item> orderItems;

    @OneToMany(mappedBy = "fish")
    private List<Review> reviews;
}