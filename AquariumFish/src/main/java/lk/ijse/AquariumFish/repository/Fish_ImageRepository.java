package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Fish_Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Fish_ImageRepository extends JpaRepository<Fish_Image, Long> {
    List<Fish_Image> findByImageUrlContaining(String imageUrl);
}
