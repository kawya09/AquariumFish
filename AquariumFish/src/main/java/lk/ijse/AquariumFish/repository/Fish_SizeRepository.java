package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Fish_Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface Fish_SizeRepository extends JpaRepository<Fish_Size, Long> {

    @Query(value = "SELECT * FROM fish_size WHERE ?1 IS NULL OR size_name LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Fish_Size> findBySizeNameContaining(String sizeName);

}