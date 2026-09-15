package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.FishDTO;
import lk.ijse.AquariumFish.service.FishService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/Fish")
@RestController
public class FishController {

    private final FishService fishService;

    public FishController(FishService fishService) {
        this.fishService = fishService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveFish(@RequestBody FishDTO fishDTO) {
        fishService.saveFish(fishDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllFish() {
        List<FishDTO> fishDTOList = fishService.getAllFish();
        return new CommonResponse(OPERATION_SUCCESS, fishDTOList, SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateFish(@RequestBody FishDTO fishDTO) {
        fishService.updateFish(fishDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteFish(@PathVariable Long id) {
        fishService.changeFishStatus(id);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterFish(@RequestParam String fishName) {
        List<FishDTO> fishDTOList = fishService.filterFish(fishName);
        return new CommonResponse(OPERATION_SUCCESS, fishDTOList, SUCCESS_MESSAGE);
    }
}