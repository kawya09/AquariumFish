package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Fish;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FishRepository extends JpaRepository<Fish, Long> {
    List<Fish> findByFishNameContaining(String fishName);
}
