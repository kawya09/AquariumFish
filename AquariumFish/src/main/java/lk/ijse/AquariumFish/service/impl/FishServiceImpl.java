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
import java.util.Optional;

@Service
@Slf4j
public class FishServiceImpl implements FishService {

    private final FishRepository fishRepository;

    public FishServiceImpl(FishRepository fishRepository) {
        this.fishRepository = fishRepository;
    }

    @Override
    public void saveFish(FishDTO fishDTO) {
        log.info("Save fish");

        try {
            Fish fish = new Fish();

            fish.setFishName(fishDTO.getFishName());
            fish.setDescription(fishDTO.getDescription());
            fish.setPrice(fishDTO.getPrice());
            fish.setStockQty(fishDTO.getStockQty());
            fish.setStatus(fishDTO.getStatus());

            fishRepository.save(fish);

        } catch (Exception e) {
            log.error("Error saving fish", e);
            throw e;
        }
    }

    @Override
    public List<FishDTO> getAllFish() {
        log.info("Get all fish");

        try {
            List<FishDTO> fishDTOList = new ArrayList<>();

            List<Fish> fishList = fishRepository.findAll();

            for (Fish fish : fishList) {
                FishDTO fishDTO = new FishDTO();

                fishDTO.setId(fish.getId());
                fishDTO.setFishName(fish.getFishName());
                fishDTO.setDescription(fish.getDescription());
                fishDTO.setPrice(fish.getPrice());
                fishDTO.setStockQty(fish.getStockQty());
                fishDTO.setStatus(fish.getStatus());

                fishDTOList.add(fishDTO);
            }

            return fishDTOList;

        } catch (Exception e) {
            log.error("Error getting all fish", e);
            throw e;
        }
    }

    @Override
    public void updateFish(FishDTO fishDTO) {
        log.info("Update fish");

        try {
            Optional<Fish> optionalFish =
                    fishRepository.findById(fishDTO.getId());

            if (optionalFish.isEmpty()) {
                throw new RuntimeException("Fish not found");
            }

            Fish fish = optionalFish.get();

            fish.setFishName(fishDTO.getFishName());
            fish.setDescription(fishDTO.getDescription());
            fish.setPrice(fishDTO.getPrice());
            fish.setStockQty(fishDTO.getStockQty());
            fish.setStatus(fishDTO.getStatus());

            fishRepository.save(fish);

        } catch (Exception e) {
            log.error("Error updating fish", e);
            throw e;
        }
    }

    @Override
    public void changeFishStatus(long fishId) {
        log.info("Change fish status");

        try {
            Optional<Fish> optionalFish =
                    fishRepository.findById(fishId);

            if (optionalFish.isEmpty()) {
                throw new RuntimeException("Fish not found");
            }

            Fish fish = optionalFish.get();

            fish.setStatus(UserStatus.INACTIVE);

            fishRepository.save(fish);

        } catch (Exception e) {
            log.error("Error changing fish status", e);
            throw e;
        }
    }

    @Override
    public List<FishDTO> filterFish(String fishName) {
        log.info("Filter fish");

        try {
            List<FishDTO> fishDTOList = new ArrayList<>();

            List<Fish> fishList =
                    fishRepository.findByFishNameContaining(fishName);

            for (Fish fish : fishList) {
                FishDTO fishDTO = new FishDTO();

                fishDTO.setId(fish.getId());
                fishDTO.setFishName(fish.getFishName());
                fishDTO.setDescription(fish.getDescription());
                fishDTO.setPrice(fish.getPrice());
                fishDTO.setStockQty(fish.getStockQty());
                fishDTO.setStatus(fish.getStatus());

                fishDTOList.add(fishDTO);
            }

            return fishDTOList;

        } catch (Exception e) {
            log.error("Error filtering fish", e);
            throw e;
        }
    }
}