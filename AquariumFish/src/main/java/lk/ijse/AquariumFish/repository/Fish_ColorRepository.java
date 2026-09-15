package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Fish_Color;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface Fish_ColorRepository extends JpaRepository<Fish_Color, Long> {

    @Query(value = "SELECT * FROM fish_color WHERE ?1 IS NULL OR color_name LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Fish_Color> findByColorNameContaining(String colorName);

}