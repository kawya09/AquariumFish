package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Fish_Size;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Fish_SizeRepository extends JpaRepository<Fish_Size, Long> {
    List<Fish_Size> findBySizeNameContaining(String sizeName);
}
