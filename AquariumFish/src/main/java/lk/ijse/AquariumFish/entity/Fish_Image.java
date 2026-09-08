package lk.ijse.AquariumFish.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fish_Image {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String imageUrl;
    private Boolean isPrimary;

    @ManyToOne
    @JoinColumn(name = "fish_id")
    private Fish fish;
}