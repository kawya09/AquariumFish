package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Fish;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FishRepository extends JpaRepository<Fish, Long> {
}
