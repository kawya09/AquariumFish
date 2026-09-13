package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Fish_BreedDTO;

import java.util.List;

public interface Fish_BreedService {

    void saveBreed(Fish_BreedDTO dto);

    List<Fish_BreedDTO> getAllBreeds();

    Fish_BreedDTO getBreedById(Long id);

    void updateBreed(Fish_BreedDTO dto);

    void changeBreedStatus(Long id);

    List<Fish_BreedDTO> filterBreeds(String breedName);
}