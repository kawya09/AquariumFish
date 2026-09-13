package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Fish_ImageDTO;

import java.util.List;

public interface Fish_ImageService {

    void saveImage(Fish_ImageDTO dto);

    List<Fish_ImageDTO> getAllImages();

    Fish_ImageDTO getImageById(Long id);

    void updateImage(Fish_ImageDTO dto);

    void changeImageStatus(Long id);
}