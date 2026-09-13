package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Fish_BreedDTO;
import lk.ijse.AquariumFish.entity.Fish_Breed;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Fish_BreedRepository;
import lk.ijse.AquariumFish.service.Fish_BreedService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class Fish_BreedServiceImpl implements Fish_BreedService {

    private final Fish_BreedRepository repository;

    public Fish_BreedServiceImpl(Fish_BreedRepository repository) {
        this.repository = repository;
    }

    @Override
    public void saveBreed(Fish_BreedDTO dto) {

        Fish_Breed breed = new Fish_Breed();

        breed.setBreedName(dto.getBreedName());
        breed.setDescription(dto.getDescription());
        breed.setStatus(dto.getStatus());

        repository.save(breed);
    }

    @Override
    public List<Fish_BreedDTO> getAllBreeds() {

        List<Fish_BreedDTO> list = new ArrayList<>();

        for (Fish_Breed breed : repository.findAll()) {

            Fish_BreedDTO dto = new Fish_BreedDTO();

            dto.setId(breed.getId());
            dto.setBreedName(breed.getBreedName());
            dto.setDescription(breed.getDescription());
            dto.setStatus(breed.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public Fish_BreedDTO getBreedById(Long id) {

        Fish_Breed breed = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Breed not found"));

        Fish_BreedDTO dto = new Fish_BreedDTO();

        dto.setId(breed.getId());
        dto.setBreedName(breed.getBreedName());
        dto.setDescription(breed.getDescription());
        dto.setStatus(breed.getStatus());

        return dto;
    }

    @Override
    public void updateBreed(Fish_BreedDTO dto) {

        Fish_Breed breed = repository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Breed not found"));

        breed.setBreedName(dto.getBreedName());
        breed.setDescription(dto.getDescription());
        breed.setStatus(dto.getStatus());

        repository.save(breed);
    }

    @Override
    public void changeBreedStatus(Long id) {

        Fish_Breed breed = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Breed not found"));

        breed.setStatus(UserStatus.INACTIVE);

        repository.save(breed);
    }

    @Override
    public List<Fish_BreedDTO> filterBreeds(String breedName) {

        List<Fish_BreedDTO> list = new ArrayList<>();

        for (Fish_Breed breed :
                repository.findByBreedNameContaining(breedName)) {

            Fish_BreedDTO dto = new Fish_BreedDTO();

            dto.setId(breed.getId());
            dto.setBreedName(breed.getBreedName());
            dto.setDescription(breed.getDescription());
            dto.setStatus(breed.getStatus());

            list.add(dto);
        }

        return list;
    }
}