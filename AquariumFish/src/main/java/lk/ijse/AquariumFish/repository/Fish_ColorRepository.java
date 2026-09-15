package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Fish_Color;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Fish_ColorRepository extends JpaRepository<Fish_Color, Long> {
    List<Fish_Color> findByColorNameContaining(String colorName);
}
