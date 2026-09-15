package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Fish_CategoryDTO;

import java.util.List;

public interface Fish_CategoryService {

    void saveCategory(Fish_CategoryDTO categoryDTO);

    List<Fish_CategoryDTO> getAllCategories();

    void updateCategory(Fish_CategoryDTO categoryDTO);

    void changeCategoryStatus(long categoryId);

    List<Fish_CategoryDTO> filterCategories(String categoryName);
}