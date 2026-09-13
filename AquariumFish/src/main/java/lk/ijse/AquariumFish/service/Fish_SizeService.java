package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Fish_SizeDTO;

import java.util.List;

public interface Fish_SizeService {

    void saveSize(Fish_SizeDTO dto);

    List<Fish_SizeDTO> getAllSizes();

    Fish_SizeDTO getSizeById(Long id);

    void updateSize(Fish_SizeDTO dto);

    void changeSizeStatus(Long id);

    List<Fish_SizeDTO> filterSizes(String sizeName);
}