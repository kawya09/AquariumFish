package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Fish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FishRepository extends JpaRepository<Fish, Long> {

    @Query(value = "SELECT * FROM fish WHERE ?1 IS NULL OR fish_name LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Fish> findByFishNameContaining(String fishName);

}