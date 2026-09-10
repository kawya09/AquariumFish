package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.DeliveryDTO;
import lk.ijse.AquariumFish.dto.Fish_BreedDTO;

import java.util.List;

public interface Fish_BreedService {
    void saveFish_Breed(Fish_BreedDTO fish_breedDTO);

    List<Fish_BreedDTO> getAllFish_Breeds();

    void updateFish_Breed(Fish_BreedDTO fish_breedDTO);

    void changeFish_BreedStatus(long fish_breedDTO);

    List<Fish_BreedDTO> filterFish_Breeds(String username);

    void changeFish_BreedRole(long fish_breedID, long roleID);
}
