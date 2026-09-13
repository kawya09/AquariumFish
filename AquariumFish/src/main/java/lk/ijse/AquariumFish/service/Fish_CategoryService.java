package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Fish_CategoryDTO;

import java.util.List;

public interface Fish_CategoryService {

    void saveCategory(Fish_CategoryDTO dto);

    List<Fish_CategoryDTO> getAllCategories();

    Fish_CategoryDTO getCategoryById(Long id);

    void updateCategory(Fish_CategoryDTO dto);

    void changeCategoryStatus(Long id);

    List<Fish_CategoryDTO> filterCategories(String categoryName);
}