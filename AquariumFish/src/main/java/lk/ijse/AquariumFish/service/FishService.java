package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.FishDTO;

import java.util.List;

public interface FishService {

    void saveFish(FishDTO fishDTO);

    List<FishDTO> getAllFish();

    FishDTO getFishById(Long id);

    void updateFish(FishDTO fishDTO);

    void changeFishStatus(Long id);

    List<FishDTO> filterFish(String fishName);
}