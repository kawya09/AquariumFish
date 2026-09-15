package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Fish_ImageDTO;
import lk.ijse.AquariumFish.entity.Fish_Image;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Fish_ImageRepository;
import lk.ijse.AquariumFish.service.Fish_ImageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class Fish_ImageServiceImpl implements Fish_ImageService {

    private final Fish_ImageRepository imageRepository;

    public Fish_ImageServiceImpl(Fish_ImageRepository imageRepository) {
        this.imageRepository = imageRepository;
    }

    @Override
    public void saveImage(Fish_ImageDTO imageDTO) {
        log.info("Save image");

        try {
            Fish_Image image = new Fish_Image();

            image.setImageUrl(imageDTO.getImageUrl());
            image.setIsPrimary(imageDTO.getIsPrimary());
            image.setStatus(imageDTO.getStatus());

            imageRepository.save(image);

        } catch (Exception e) {
            log.error("Error saving image", e);
            throw e;
        }
    }

    @Override
    public List<Fish_ImageDTO> getAllImages() {
        log.info("Get all images");

        try {
            List<Fish_ImageDTO> imageDTOList = new ArrayList<>();

            List<Fish_Image> images = imageRepository.findAll();

            for (Fish_Image image : images) {
                Fish_ImageDTO imageDTO = new Fish_ImageDTO();

                imageDTO.setId(image.getId());
                imageDTO.setImageUrl(image.getImageUrl());
                imageDTO.setIsPrimary(image.getIsPrimary());
                imageDTO.setStatus(image.getStatus());

                imageDTOList.add(imageDTO);
            }

            return imageDTOList;

        } catch (Exception e) {
            log.error("Error getting all images", e);
            throw e;
        }
    }

    @Override
    public void updateImage(Fish_ImageDTO imageDTO) {
        log.info("Update image");

        try {
            Optional<Fish_Image> optionalImage =
                    imageRepository.findById(imageDTO.getId());

            if (optionalImage.isEmpty()) {
                throw new RuntimeException("Image not found");
            }

            Fish_Image image = optionalImage.get();

            image.setImageUrl(imageDTO.getImageUrl());
            image.setIsPrimary(imageDTO.getIsPrimary());
            image.setStatus(imageDTO.getStatus());

            imageRepository.save(image);

        } catch (Exception e) {
            log.error("Error updating image", e);
            throw e;
        }
    }

    @Override
    public void changeImageStatus(long imageId) {
        log.info("Change image status");

        try {
            Optional<Fish_Image> optionalImage =
                    imageRepository.findById(imageId);

            if (optionalImage.isEmpty()) {
                throw new RuntimeException("Image not found");
            }

            Fish_Image image = optionalImage.get();

            image.setStatus(UserStatus.INACTIVE);

            imageRepository.save(image);

        } catch (Exception e) {
            log.error("Error changing image status", e);
            throw e;
        }
    }

    @Override
    public List<Fish_ImageDTO> filterImages(String imageUrl) {
        log.info("Filter images");

        try {
            List<Fish_ImageDTO> imageDTOList = new ArrayList<>();

            List<Fish_Image> images =
                    imageRepository.findByImageUrlContaining(imageUrl);

            for (Fish_Image image : images) {
                Fish_ImageDTO imageDTO = new Fish_ImageDTO();

                imageDTO.setId(image.getId());
                imageDTO.setImageUrl(image.getImageUrl());
                imageDTO.setIsPrimary(image.getIsPrimary());
                imageDTO.setStatus(image.getStatus());

                imageDTOList.add(imageDTO);
            }

            return imageDTOList;

        } catch (Exception e) {
            log.error("Error filtering images", e);
            throw e;
        }
    }
}