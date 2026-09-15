package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Fish_BreedDTO;
import lk.ijse.AquariumFish.entity.Fish_Breed;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Fish_BreedRepository;
import lk.ijse.AquariumFish.service.Fish_BreedService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class Fish_BreedServiceImpl implements Fish_BreedService {

    private final Fish_BreedRepository breedRepository;

    public Fish_BreedServiceImpl(Fish_BreedRepository breedRepository) {
        this.breedRepository = breedRepository;
    }

    @Override
    public void saveBreed(Fish_BreedDTO breedDTO) {
        log.info("Save breed");

        try {
            Fish_Breed breed = new Fish_Breed();

            breed.setBreedName(breedDTO.getBreedName());
            breed.setDescription(breedDTO.getDescription());
            breed.setStatus(breedDTO.getStatus());

            breedRepository.save(breed);

        } catch (Exception e) {
            log.error("Error saving breed", e);
            throw e;
        }
    }

    @Override
    public List<Fish_BreedDTO> getAllBreeds() {
        log.info("Get all breeds");

        try {
            List<Fish_BreedDTO> breedDTOList = new ArrayList<>();

            List<Fish_Breed> breeds = breedRepository.findAll();

            for (Fish_Breed breed : breeds) {
                Fish_BreedDTO breedDTO = new Fish_BreedDTO();

                breedDTO.setId(breed.getId());
                breedDTO.setBreedName(breed.getBreedName());
                breedDTO.setDescription(breed.getDescription());
                breedDTO.setStatus(breed.getStatus());

                breedDTOList.add(breedDTO);
            }

            return breedDTOList;

        } catch (Exception e) {
            log.error("Error getting all breeds", e);
            throw e;
        }
    }

    @Override
    public void updateBreed(Fish_BreedDTO breedDTO) {
        log.info("Update breed");

        try {
            Optional<Fish_Breed> optionalBreed =
                    breedRepository.findById(breedDTO.getId());

            if (optionalBreed.isEmpty()) {
                throw new RuntimeException("Breed not found");
            }

            Fish_Breed breed = optionalBreed.get();

            breed.setBreedName(breedDTO.getBreedName());
            breed.setDescription(breedDTO.getDescription());
            breed.setStatus(breedDTO.getStatus());

            breedRepository.save(breed);

        } catch (Exception e) {
            log.error("Error updating breed", e);
            throw e;
        }
    }

    @Override
    public void changeBreedStatus(long breedId) {
        log.info("Change breed status");

        try {
            Optional<Fish_Breed> optionalBreed =
                    breedRepository.findById(breedId);

            if (optionalBreed.isEmpty()) {
                throw new RuntimeException("Breed not found");
            }

            Fish_Breed breed = optionalBreed.get();

            breed.setStatus(UserStatus.INACTIVE);

            breedRepository.save(breed);

        } catch (Exception e) {
            log.error("Error changing breed status", e);
            throw e;
        }
    }

    @Override
    public List<Fish_BreedDTO> filterBreeds(String breedName) {
        log.info("Filter breeds");

        try {
            List<Fish_BreedDTO> breedDTOList = new ArrayList<>();

            List<Fish_Breed> breeds =
                    breedRepository.findByBreedNameContaining(breedName);

            for (Fish_Breed breed : breeds) {
                Fish_BreedDTO breedDTO = new Fish_BreedDTO();

                breedDTO.setId(breed.getId());
                breedDTO.setBreedName(breed.getBreedName());
                breedDTO.setDescription(breed.getDescription());
                breedDTO.setStatus(breed.getStatus());

                breedDTOList.add(breedDTO);
            }

            return breedDTOList;

        } catch (Exception e) {
            log.error("Error filtering breeds", e);
            throw e;
        }
    }
}