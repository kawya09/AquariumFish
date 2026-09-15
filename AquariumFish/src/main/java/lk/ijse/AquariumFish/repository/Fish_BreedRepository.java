package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Fish_Breed;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface Fish_BreedRepository extends JpaRepository<Fish_Breed, Long> {

    @Query(value = "SELECT * FROM fish_breed WHERE ?1 IS NULL OR breed_name LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Fish_Breed> findByBreedNameContaining(String breedName);

}