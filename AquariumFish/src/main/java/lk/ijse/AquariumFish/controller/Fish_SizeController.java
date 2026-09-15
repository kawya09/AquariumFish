package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.Fish_SizeDTO;
import lk.ijse.AquariumFish.service.Fish_SizeService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/FishSize")
@RestController
public class Fish_SizeController {

    private final Fish_SizeService sizeService;

    public Fish_SizeController(Fish_SizeService sizeService) {
        this.sizeService = sizeService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveSize(@RequestBody Fish_SizeDTO sizeDTO) {
        sizeService.saveSize(sizeDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllSize() {
        List<Fish_SizeDTO> sizeDTOList = sizeService.getAllSizes();
        return new CommonResponse(OPERATION_SUCCESS, sizeDTOList, SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateSize(@RequestBody Fish_SizeDTO sizeDTO) {
        sizeService.updateSize(sizeDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteSize(@PathVariable Long id) {
        sizeService.changeSizeStatus(id);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterSize(@RequestParam String sizeName) {
        List<Fish_SizeDTO> sizeDTOList = sizeService.filterSizes(sizeName);
        return new CommonResponse(OPERATION_SUCCESS, sizeDTOList, SUCCESS_MESSAGE);
    }
}