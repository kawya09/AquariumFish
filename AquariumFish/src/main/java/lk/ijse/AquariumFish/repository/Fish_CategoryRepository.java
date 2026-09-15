package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Fish_Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface Fish_CategoryRepository extends JpaRepository<Fish_Category, Long> {

    @Query(value = "SELECT * FROM fish_category WHERE ?1 IS NULL OR category_name LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Fish_Category> findByCategoryNameContaining(String categoryName);

}