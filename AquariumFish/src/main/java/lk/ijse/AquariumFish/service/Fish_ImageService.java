package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Fish_ImageDTO;

import java.util.List;

public interface Fish_ImageService {

    void saveImage(Fish_ImageDTO imageDTO);

    List<Fish_ImageDTO> getAllImages();

    void updateImage(Fish_ImageDTO imageDTO);

    void changeImageStatus(long imageId);

    List<Fish_ImageDTO> filterImages(String imageUrl);
}