package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Fish_ColorDTO;
import lk.ijse.AquariumFish.entity.Fish_Color;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Fish_ColorRepository;
import lk.ijse.AquariumFish.service.Fish_colorService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class Fish_ColorServiceImpl implements Fish_colorService {

    private final Fish_ColorRepository colorRepository;

    public Fish_ColorServiceImpl(Fish_ColorRepository colorRepository) {
        this.colorRepository = colorRepository;
    }

    @Override
    public void saveColor(Fish_ColorDTO colorDTO) {
        log.info("Save color");

        try {
            Fish_Color color = new Fish_Color();

            color.setColorName(colorDTO.getColorName());
            color.setStatus(colorDTO.getStatus());

            colorRepository.save(color);

        } catch (Exception e) {
            log.error("Error saving color", e);
            throw e;
        }
    }

    @Override
    public List<Fish_ColorDTO> getAllColors() {
        log.info("Get all colors");

        try {
            List<Fish_ColorDTO> colorDTOList = new ArrayList<>();

            List<Fish_Color> colors = colorRepository.findAll();

            for (Fish_Color color : colors) {
                Fish_ColorDTO colorDTO = new Fish_ColorDTO();

                colorDTO.setId(color.getId());
                colorDTO.setColorName(color.getColorName());
                colorDTO.setStatus(color.getStatus());

                colorDTOList.add(colorDTO);
            }

            return colorDTOList;

        } catch (Exception e) {
            log.error("Error getting all colors", e);
            throw e;
        }
    }

    @Override
    public void updateColor(Fish_ColorDTO colorDTO) {
        log.info("Update color");

        try {
            Optional<Fish_Color> optionalColor =
                    colorRepository.findById(colorDTO.getId());

            if (optionalColor.isEmpty()) {
                throw new RuntimeException("Color not found");
            }

            Fish_Color color = optionalColor.get();

            color.setColorName(colorDTO.getColorName());
            color.setStatus(colorDTO.getStatus());

            colorRepository.save(color);

        } catch (Exception e) {
            log.error("Error updating color", e);
            throw e;
        }
    }

    @Override
    public void changeColorStatus(long colorId) {
        log.info("Change color status");

        try {
            Optional<Fish_Color> optionalColor =
                    colorRepository.findById(colorId);

            if (optionalColor.isEmpty()) {
                throw new RuntimeException("Color not found");
            }

            Fish_Color color = optionalColor.get();

            color.setStatus(UserStatus.INACTIVE);

            colorRepository.save(color);

        } catch (Exception e) {
            log.error("Error changing color status", e);
            throw e;
        }
    }

    @Override
    public List<Fish_ColorDTO> filterColors(String colorName) {
        log.info("Filter colors");

        try {
            List<Fish_ColorDTO> colorDTOList = new ArrayList<>();

            List<Fish_Color> colors =
                    colorRepository.findByColorNameContaining(colorName);

            for (Fish_Color color : colors) {
                Fish_ColorDTO colorDTO = new Fish_ColorDTO();

                colorDTO.setId(color.getId());
                colorDTO.setColorName(color.getColorName());
                colorDTO.setStatus(color.getStatus());

                colorDTOList.add(colorDTO);
            }

            return colorDTOList;

        } catch (Exception e) {
            log.error("Error filtering colors", e);
            throw e;
        }
    }
}