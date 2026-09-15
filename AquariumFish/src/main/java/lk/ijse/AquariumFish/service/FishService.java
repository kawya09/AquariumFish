package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.FishDTO;

import java.util.List;

public interface FishService {

    void saveFish(FishDTO fishDTO);

    List<FishDTO> getAllFish();

    void updateFish(FishDTO fishDTO);

    void changeFishStatus(long fishId);

    List<FishDTO> filterFish(String fishName);
}