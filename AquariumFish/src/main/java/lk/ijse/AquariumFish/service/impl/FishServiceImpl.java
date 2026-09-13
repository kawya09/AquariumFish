package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.FishDTO;
import lk.ijse.AquariumFish.entity.Fish;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.FishRepository;
import lk.ijse.AquariumFish.service.FishService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class FishServiceImpl implements FishService {

    private final FishRepository fishRepository;

    public FishServiceImpl(FishRepository fishRepository) {
        this.fishRepository = fishRepository;
    }

    @Override
    public void saveFish(FishDTO dto) {

        Fish fish = new Fish();

        fish.setFishName(dto.getFishName());
        fish.setDescription(dto.getDescription());
        fish.setPrice(dto.getPrice());
        fish.setStockQty(dto.getStockQty());
        fish.setStatus(dto.getStatus());

        fishRepository.save(fish);
    }

    @Override
    public List<FishDTO> getAllFish() {

        List<FishDTO> list = new ArrayList<>();

        for (Fish fish : fishRepository.findAll()) {

            FishDTO dto = new FishDTO();

            dto.setId(fish.getId());
            dto.setFishName(fish.getFishName());
            dto.setDescription(fish.getDescription());
            dto.setPrice(fish.getPrice());
            dto.setStockQty(fish.getStockQty());
            dto.setStatus(fish.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public FishDTO getFishById(Long id) {

        Fish fish = fishRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Fish not found"));

        FishDTO dto = new FishDTO();

        dto.setId(fish.getId());
        dto.setFishName(fish.getFishName());
        dto.setDescription(fish.getDescription());
        dto.setPrice(fish.getPrice());
        dto.setStockQty(fish.getStockQty());
        dto.setStatus(fish.getStatus());

        return dto;
    }

    @Override
    public void updateFish(FishDTO dto) {

        Fish fish = fishRepository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Fish not found"));

        fish.setFishName(dto.getFishName());
        fish.setDescription(dto.getDescription());
        fish.setPrice(dto.getPrice());
        fish.setStockQty(dto.getStockQty());
        fish.setStatus(dto.getStatus());

        fishRepository.save(fish);
    }

    @Override
    public void changeFishStatus(Long id) {

        Fish fish = fishRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Fish not found"));

        fish.setStatus(UserStatus.INACTIVE);

        fishRepository.save(fish);
    }

    @Override
    public List<FishDTO> filterFish(String fishName) {

        List<FishDTO> list = new ArrayList<>();

        for (Fish fish :
                fishRepository.findByFishNameContaining(fishName)) {

            FishDTO dto = new FishDTO();

            dto.setId(fish.getId());
            dto.setFishName(fish.getFishName());
            dto.setDescription(fish.getDescription());
            dto.setPrice(fish.getPrice());
            dto.setStockQty(fish.getStockQty());
            dto.setStatus(fish.getStatus());

            list.add(dto);
        }

        return list;
    }
}