package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.Fish_CategoryDTO;
import lk.ijse.AquariumFish.service.Fish_CategoryService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/FishCategory")
@RestController
public class Fish_CategoryController {

    private final Fish_CategoryService categoryService;

    public Fish_CategoryController(Fish_CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveCategory(@RequestBody Fish_CategoryDTO categoryDTO) {
        categoryService.saveCategory(categoryDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllCategory() {
        List<Fish_CategoryDTO> categoryDTOList = categoryService.getAllCategories();
        return new CommonResponse(OPERATION_SUCCESS, categoryDTOList, SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateCategory(@RequestBody Fish_CategoryDTO categoryDTO) {
        categoryService.updateCategory(categoryDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteCategory(@PathVariable Long id) {
        categoryService.changeCategoryStatus(id);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterCategory(@RequestParam String categoryName) {
        List<Fish_CategoryDTO> categoryDTOList = categoryService.filterCategories(categoryName);
        return new CommonResponse(OPERATION_SUCCESS, categoryDTOList, SUCCESS_MESSAGE);
    }
}