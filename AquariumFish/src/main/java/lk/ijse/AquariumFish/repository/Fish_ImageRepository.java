package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Fish_Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface Fish_ImageRepository extends JpaRepository<Fish_Image, Long> {

    @Query(value = "SELECT * FROM fish_image WHERE ?1 IS NULL OR image_url LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Fish_Image> findByImageUrlContaining(String imageUrl);

}