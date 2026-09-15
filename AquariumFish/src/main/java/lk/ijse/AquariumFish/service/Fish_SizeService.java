package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Fish_SizeDTO;

import java.util.List;

public interface Fish_SizeService {

    void saveSize(Fish_SizeDTO sizeDTO);

    List<Fish_SizeDTO> getAllSizes();

    void updateSize(Fish_SizeDTO sizeDTO);

    void changeSizeStatus(long sizeId);

    List<Fish_SizeDTO> filterSizes(String sizeName);
}