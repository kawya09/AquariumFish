package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Fish_SizeDTO;
import lk.ijse.AquariumFish.entity.Fish_Size;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Fish_SizeRepository;
import lk.ijse.AquariumFish.service.Fish_SizeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class Fish_SizeServiceImpl implements Fish_SizeService {

    private final Fish_SizeRepository sizeRepository;

    public Fish_SizeServiceImpl(Fish_SizeRepository sizeRepository) {
        this.sizeRepository = sizeRepository;
    }

    @Override
    public void saveSize(Fish_SizeDTO sizeDTO) {
        log.info("Save size");

        try {
            Fish_Size size = new Fish_Size();

            size.setSizeName(sizeDTO.getSizeName());
            size.setStatus(sizeDTO.getStatus());

            sizeRepository.save(size);

        } catch (Exception e) {
            log.error("Error saving size", e);
            throw e;
        }
    }

    @Override
    public List<Fish_SizeDTO> getAllSizes() {
        log.info("Get all sizes");

        try {
            List<Fish_SizeDTO> sizeDTOList = new ArrayList<>();

            List<Fish_Size> sizes = sizeRepository.findAll();

            for (Fish_Size size : sizes) {
                Fish_SizeDTO sizeDTO = new Fish_SizeDTO();

                sizeDTO.setId(size.getId());
                sizeDTO.setSizeName(size.getSizeName());
                sizeDTO.setStatus(size.getStatus());

                sizeDTOList.add(sizeDTO);
            }

            return sizeDTOList;

        } catch (Exception e) {
            log.error("Error getting all sizes", e);
            throw e;
        }
    }

    @Override
    public void updateSize(Fish_SizeDTO sizeDTO) {
        log.info("Update size");

        try {
            Optional<Fish_Size> optionalSize =
                    sizeRepository.findById(sizeDTO.getId());

            if (optionalSize.isEmpty()) {
                throw new RuntimeException("Size not found");
            }

            Fish_Size size = optionalSize.get();

            size.setSizeName(sizeDTO.getSizeName());
            size.setStatus(sizeDTO.getStatus());

            sizeRepository.save(size);

        } catch (Exception e) {
            log.error("Error updating size", e);
            throw e;
        }
    }

    @Override
    public void changeSizeStatus(long sizeId) {
        log.info("Change size status");

        try {
            Optional<Fish_Size> optionalSize =
                    sizeRepository.findById(sizeId);

            if (optionalSize.isEmpty()) {
                throw new RuntimeException("Size not found");
            }

            Fish_Size size = optionalSize.get();

            size.setStatus(UserStatus.INACTIVE);

            sizeRepository.save(size);

        } catch (Exception e) {
            log.error("Error changing size status", e);
            throw e;
        }
    }

    @Override
    public List<Fish_SizeDTO> filterSizes(String sizeName) {
        log.info("Filter sizes");

        try {
            List<Fish_SizeDTO> sizeDTOList = new ArrayList<>();

            List<Fish_Size> sizes =
                    sizeRepository.findBySizeNameContaining(sizeName);

            for (Fish_Size size : sizes) {
                Fish_SizeDTO sizeDTO = new Fish_SizeDTO();

                sizeDTO.setId(size.getId());
                sizeDTO.setSizeName(size.getSizeName());
                sizeDTO.setStatus(size.getStatus());

                sizeDTOList.add(sizeDTO);
            }

            return sizeDTOList;

        } catch (Exception e) {
            log.error("Error filtering sizes", e);
            throw e;
        }
    }
}