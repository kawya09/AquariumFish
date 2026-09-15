package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Fish_BreedDTO;

import java.util.List;

public interface Fish_BreedService {

    void saveBreed(Fish_BreedDTO breedDTO);

    List<Fish_BreedDTO> getAllBreeds();

    void updateBreed(Fish_BreedDTO breedDTO);

    void changeBreedStatus(long breedId);

    List<Fish_BreedDTO> filterBreeds(String breedName);
}