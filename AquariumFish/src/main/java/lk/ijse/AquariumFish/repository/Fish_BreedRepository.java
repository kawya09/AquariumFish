package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Fish_Breed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Fish_BreedRepository extends JpaRepository<Fish_Breed, Long> {
    List<Fish_Breed> findByBreedNameContaining(String breedName);
}
