package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Fish_ImageDTO;
import lk.ijse.AquariumFish.entity.Fish_Image;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Fish_ImageRepository;
import lk.ijse.AquariumFish.service.Fish_ImageService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class Fish_ImageServiceImpl implements Fish_ImageService {

    private final Fish_ImageRepository repository;

    public Fish_ImageServiceImpl(Fish_ImageRepository repository) {
        this.repository = repository;
    }

    @Override
    public void saveImage(Fish_ImageDTO dto) {

        Fish_Image image = new Fish_Image();

        image.setImageUrl(dto.getImageUrl());
        image.setIsPrimary(dto.getIsPrimary());
        image.setStatus(dto.getStatus());

        repository.save(image);
    }

    @Override
    public List<Fish_ImageDTO> getAllImages() {

        List<Fish_ImageDTO> list = new ArrayList<>();

        for (Fish_Image image : repository.findAll()) {

            Fish_ImageDTO dto = new Fish_ImageDTO();

            dto.setId(image.getId());
            dto.setImageUrl(image.getImageUrl());
            dto.setIsPrimary(image.getIsPrimary());
            dto.setStatus(image.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public Fish_ImageDTO getImageById(Long id) {

        Fish_Image image = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Image not found"));

        Fish_ImageDTO dto = new Fish_ImageDTO();

        dto.setId(image.getId());
        dto.setImageUrl(image.getImageUrl());
        dto.setIsPrimary(image.getIsPrimary());
        dto.setStatus(image.getStatus());

        return dto;
    }

    @Override
    public void updateImage(Fish_ImageDTO dto) {

        Fish_Image image = repository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Image not found"));

        image.setImageUrl(dto.getImageUrl());
        image.setIsPrimary(dto.getIsPrimary());
        image.setStatus(dto.getStatus());

        repository.save(image);
    }

    @Override
    public void changeImageStatus(Long id) {

        Fish_Image image = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Image not found"));

        image.setStatus(UserStatus.INACTIVE);

        repository.save(image);
    }
}