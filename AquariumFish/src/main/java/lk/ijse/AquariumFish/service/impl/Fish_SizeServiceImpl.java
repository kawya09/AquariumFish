package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Fish_SizeDTO;
import lk.ijse.AquariumFish.entity.Fish_Size;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Fish_SizeRepository;
import lk.ijse.AquariumFish.service.Fish_SizeService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class Fish_SizeServiceImpl implements Fish_SizeService {

    private final Fish_SizeRepository repository;

    public Fish_SizeServiceImpl(Fish_SizeRepository repository) {
        this.repository = repository;
    }

    @Override
    public void saveSize(Fish_SizeDTO dto) {

        Fish_Size size = new Fish_Size();

        size.setSizeName(dto.getSizeName());
        size.setStatus(dto.getStatus());

        repository.save(size);
    }

    @Override
    public List<Fish_SizeDTO> getAllSizes() {

        List<Fish_SizeDTO> list = new ArrayList<>();

        for (Fish_Size size : repository.findAll()) {

            Fish_SizeDTO dto = new Fish_SizeDTO();

            dto.setId(size.getId());
            dto.setSizeName(size.getSizeName());
            dto.setStatus(size.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public Fish_SizeDTO getSizeById(Long id) {

        Fish_Size size = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Size not found"));

        Fish_SizeDTO dto = new Fish_SizeDTO();

        dto.setId(size.getId());
        dto.setSizeName(size.getSizeName());
        dto.setStatus(size.getStatus());

        return dto;
    }

    @Override
    public void updateSize(Fish_SizeDTO dto) {

        Fish_Size size = repository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Size not found"));

        size.setSizeName(dto.getSizeName());
        size.setStatus(dto.getStatus());

        repository.save(size);
    }

    @Override
    public void changeSizeStatus(Long id) {

        Fish_Size size = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Size not found"));

        size.setStatus(UserStatus.INACTIVE);

        repository.save(size);
    }

    @Override
    public List<Fish_SizeDTO> filterSizes(String sizeName) {

        List<Fish_SizeDTO> list = new ArrayList<>();

        for (Fish_Size size :
                repository.findBySizeNameContaining(sizeName)) {

            Fish_SizeDTO dto = new Fish_SizeDTO();

            dto.setId(size.getId());
            dto.setSizeName(size.getSizeName());
            dto.setStatus(size.getStatus());

            list.add(dto);
        }

        return list;
    }
}