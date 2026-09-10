package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.DeliveryDTO;
import lk.ijse.AquariumFish.dto.Fish_BreedDTO;
import lk.ijse.AquariumFish.entity.Delivery;
import lk.ijse.AquariumFish.entity.Fish_Breed;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.repository.Fish_BreedRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.service.Fish_BreedService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class Fish_BreedServiceImpl implements Fish_BreedService {
    private final Fish_BreedRepository fish_breedRepository;
    private final RoleRepository roleRepository;

    public Fish_BreedServiceImpl(Fish_BreedRepository fish_breedRepository,RoleRepository roleRepository) {
        this.fish_breedRepository = fish_breedRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void saveFish_Breed(Fish_BreedDTO fish_breedDTO) {
        log.info("Saving Fish Breed...");

        try {
            Role role = roleRepository.findById(fish_breedDTO.getId())
                    .orElseThrow(() -> new RuntimeException( "fish_breed not found " ));
            Fish_Breed fish_breed = new Fish_Breed();
            fish_breed.setBreedName(fish_breedDTO.getBreedName());
            fish_breed.setDescription(fish_breedDTO.getDescription());
            fish_breed.setStatus(fish_breedDTO.getStatus());
            fish_breedRepository.save(fish_breed);
        }catch (Exception e){
            log.error("Error saving fish breed",e);
            throw e;
        }

    }

    @Override
    public List<Fish_BreedDTO> getAllFish_Breeds() {
        try {
            List<Fish_BreedDTO> fish_breedDTOList = new ArrayList<>();
            List<Fish_Breed> Fish_Breeds =fish_breedRepository.findAll();
            for (Fish_Breed fish_breed : Fish_Breeds) {
                Fish_BreedDTO fish_BreedDTO = new Fish_BreedDTO();
                fish_BreedDTO.setId(fish_breed.getId());
                fish_BreedDTO.setBreedName(fish_breed.getBreedName());
                fish_BreedDTO.setDescription(fish_breed.getDescription());
                fish_BreedDTO.setStatus(fish_breed.getStatus());

                fish_breedDTOList.add(fish_BreedDTO);

            }
            return fish_breedDTOList;
        } catch (Exception e) {
            log.error("Error getting all Fish breed");
            throw e;
        }
    }

    @Override
    public void updateFish_Breed(Fish_BreedDTO fish_breedDTO) {
        log.info("Update Fish breed... ");
        try{
            Optional<Fish_Breed> fish_breed = fish_breedRepository.findById(fish_breedDTO.getId());
            if(fish_breed.isEmpty()){
                throw new RuntimeException( "Fish breed  not found " );

            }
            Fish_Breed fish_breed1 = fish_breed.get();

            fish_breedRepository.save(fish_breed1);

            Role role = roleRepository.findById(fish_breedDTO.getId()).orElseThrow(() -> new RuntimeException( "Role not found " ));
            Fish_Breed fish_breed2 =fish_breed.get();
            fish_breedRepository.save(fish_breed1);
        }catch(Exception e){
            log.error("Error updating fish breeds ");
            throw e;
        }


    }

    @Override
    public void changeFish_BreedStatus(long fish_breedDTO) {

    }

    @Override
    public List<Fish_BreedDTO> filterFish_Breeds(String username) {
        return List.of();
    }

    @Override
    public void changeFish_BreedRole(long fish_breedID, long roleID) {

    }
}
