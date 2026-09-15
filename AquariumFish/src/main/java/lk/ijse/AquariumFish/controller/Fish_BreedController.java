package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.Fish_BreedDTO;
import lk.ijse.AquariumFish.service.Fish_BreedService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/FishBreed")
@RestController
public class Fish_BreedController {

    private final Fish_BreedService breedService;

    public Fish_BreedController(Fish_BreedService breedService) {
        this.breedService = breedService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveBreed(@RequestBody Fish_BreedDTO breedDTO) {
        breedService.saveBreed(breedDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllBreed() {
        List<Fish_BreedDTO> breedDTOList = breedService.getAllBreeds();
        return new CommonResponse(OPERATION_SUCCESS, breedDTOList, SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateBreed(@RequestBody Fish_BreedDTO breedDTO) {
        breedService.updateBreed(breedDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteBreed(@PathVariable Long id) {
        breedService.changeBreedStatus(id);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterBreed(@RequestParam String breedName) {
        List<Fish_BreedDTO> breedDTOList = breedService.filterBreeds(breedName);
        return new CommonResponse(OPERATION_SUCCESS, breedDTOList, SUCCESS_MESSAGE);
    }
}