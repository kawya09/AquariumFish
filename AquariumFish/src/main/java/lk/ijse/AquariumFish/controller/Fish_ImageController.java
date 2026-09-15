package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.Fish_ImageDTO;
import lk.ijse.AquariumFish.service.Fish_ImageService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/FishImage")
@RestController
public class Fish_ImageController {

    private final Fish_ImageService imageService;

    public Fish_ImageController(Fish_ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveImage(@RequestBody Fish_ImageDTO imageDTO) {
        imageService.saveImage(imageDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllImage() {
        List<Fish_ImageDTO> imageDTOList = imageService.getAllImages();
        return new CommonResponse(OPERATION_SUCCESS, imageDTOList, SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateImage(@RequestBody Fish_ImageDTO imageDTO) {
        imageService.updateImage(imageDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteImage(@PathVariable Long id) {
        imageService.changeImageStatus(id);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterImage(@RequestParam String imageUrl) {
        List<Fish_ImageDTO> imageDTOList = imageService.filterImages(imageUrl);
        return new CommonResponse(OPERATION_SUCCESS, imageDTOList, SUCCESS_MESSAGE);
    }
}