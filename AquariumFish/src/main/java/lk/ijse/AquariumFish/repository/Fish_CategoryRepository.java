package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Fish_Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Fish_CategoryRepository extends JpaRepository<Fish_Category, Long> {
    List<Fish_Category> findByCategoryNameContaining(String categoryName);
}
