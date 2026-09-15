package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Fish_ColorDTO;

import java.util.List;

public interface Fish_colorService {

    void saveColor(Fish_ColorDTO colorDTO);

    List<Fish_ColorDTO> getAllColors();

    void updateColor(Fish_ColorDTO colorDTO);

    void changeColorStatus(long colorId);

    List<Fish_ColorDTO> filterColors(String colorName);
}