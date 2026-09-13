package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Fish_ColorDTO;
import lk.ijse.AquariumFish.entity.Fish_Color;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Fish_ColorRepository;
import lk.ijse.AquariumFish.service.Fish_ColorService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class Fish_ColorServiceImpl implements Fish_ColorService {

    private final Fish_ColorRepository repository;

    public Fish_ColorServiceImpl(Fish_ColorRepository repository) {
        this.repository = repository;
    }

    @Override
    public void saveColor(Fish_ColorDTO dto) {

        Fish_Color color = new Fish_Color();

        color.setColorName(dto.getColorName());
        color.setStatus(dto.getStatus());

        repository.save(color);
    }

    @Override
    public List<Fish_ColorDTO> getAllColors() {

        List<Fish_ColorDTO> list = new ArrayList<>();

        for (Fish_Color color : repository.findAll()) {

            Fish_ColorDTO dto = new Fish_ColorDTO();

            dto.setId(color.getId());
            dto.setColorName(color.getColorName());
            dto.setStatus(color.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public Fish_ColorDTO getColorById(Long id) {

        Fish_Color color = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Color not found"));

        Fish_ColorDTO dto = new Fish_ColorDTO();

        dto.setId(color.getId());
        dto.setColorName(color.getColorName());
        dto.setStatus(color.getStatus());

        return dto;
    }

    @Override
    public void updateColor(Fish_ColorDTO dto) {

        Fish_Color color = repository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Color not found"));

        color.setColorName(dto.getColorName());
        color.setStatus(dto.getStatus());

        repository.save(color);
    }

    @Override
    public void changeColorStatus(Long id) {

        Fish_Color color = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Color not found"));

        color.setStatus(UserStatus.INACTIVE);

        repository.save(color);
    }

    @Override
    public List<Fish_ColorDTO> filterColors(String colorName) {

        List<Fish_ColorDTO> list = new ArrayList<>();

        for (Fish_Color color :
                repository.findByColorNameContaining(colorName)) {

            Fish_ColorDTO dto = new Fish_ColorDTO();

            dto.setId(color.getId());
            dto.setColorName(color.getColorName());
            dto.setStatus(color.getStatus());

            list.add(dto);
        }

        return list;
    }
}