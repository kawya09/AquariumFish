package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Fish_ColorDTO;

import java.util.List;

public interface Fish_ColorService {

    void saveColor(Fish_ColorDTO dto);

    List<Fish_ColorDTO> getAllColors();

    Fish_ColorDTO getColorById(Long id);

    void updateColor(Fish_ColorDTO dto);

    void changeColorStatus(Long id);

    List<Fish_ColorDTO> filterColors(String colorName);
}