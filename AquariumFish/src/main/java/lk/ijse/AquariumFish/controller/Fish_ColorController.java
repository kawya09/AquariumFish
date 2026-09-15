package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.Fish_ColorDTO;
import lk.ijse.AquariumFish.service.Fish_ColorService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/FishColor")
@RestController
public class Fish_ColorController {

    private final Fish_ColorService colorService;

    public Fish_ColorController(Fish_ColorService colorService) {
        this.colorService = colorService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveColor(@RequestBody Fish_ColorDTO colorDTO) {
        colorService.saveColor(colorDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllColor() {
        List<Fish_ColorDTO> colorDTOList = colorService.getAllColors();
        return new CommonResponse(OPERATION_SUCCESS, colorDTOList, SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateColor(@RequestBody Fish_ColorDTO colorDTO) {
        colorService.updateColor(colorDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteColor(@PathVariable Long id) {
        colorService.changeColorStatus(id);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterColor(@RequestParam String colorName) {
        List<Fish_ColorDTO> colorDTOList = colorService.filterColors(colorName);

        return new CommonResponse(OPERATION_SUCCESS, colorDTOList, SUCCESS_MESSAGE);
    }
}