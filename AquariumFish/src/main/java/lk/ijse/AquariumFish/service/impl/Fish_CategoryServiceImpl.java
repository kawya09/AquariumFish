package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Fish_CategoryDTO;
import lk.ijse.AquariumFish.entity.Fish_Category;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Fish_CategoryRepository;
import lk.ijse.AquariumFish.service.Fish_CategoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class Fish_CategoryServiceImpl implements Fish_CategoryService {

    private final Fish_CategoryRepository categoryRepository;

    public Fish_CategoryServiceImpl(Fish_CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void saveCategory(Fish_CategoryDTO categoryDTO) {
        log.info("Save category");

        try {
            Fish_Category category = new Fish_Category();

            category.setCategoryName(categoryDTO.getCategoryName());
            category.setDescription(categoryDTO.getDescription());
            category.setStatus(categoryDTO.getStatus());

            categoryRepository.save(category);

        } catch (Exception e) {
            log.error("Error saving category", e);
            throw e;
        }
    }

    @Override
    public List<Fish_CategoryDTO> getAllCategories() {
        log.info("Get all categories");

        try {
            List<Fish_CategoryDTO> categoryDTOList = new ArrayList<>();

            List<Fish_Category> categories =
                    categoryRepository.findAll();

            for (Fish_Category category : categories) {
                Fish_CategoryDTO categoryDTO = new Fish_CategoryDTO();

                categoryDTO.setId(category.getId());
                categoryDTO.setCategoryName(category.getCategoryName());
                categoryDTO.setDescription(category.getDescription());
                categoryDTO.setStatus(category.getStatus());

                categoryDTOList.add(categoryDTO);
            }

            return categoryDTOList;

        } catch (Exception e) {
            log.error("Error getting all categories", e);
            throw e;
        }
    }

    @Override
    public void updateCategory(Fish_CategoryDTO categoryDTO) {
        log.info("Update category");

        try {
            Optional<Fish_Category> optionalCategory =
                    categoryRepository.findById(categoryDTO.getId());

            if (optionalCategory.isEmpty()) {
                throw new RuntimeException("Category not found");
            }

            Fish_Category category = optionalCategory.get();

            category.setCategoryName(categoryDTO.getCategoryName());
            category.setDescription(categoryDTO.getDescription());
            category.setStatus(categoryDTO.getStatus());

            categoryRepository.save(category);

        } catch (Exception e) {
            log.error("Error updating category", e);
            throw e;
        }
    }

    @Override
    public void changeCategoryStatus(long categoryId) {
        log.info("Change category status");

        try {
            Optional<Fish_Category> optionalCategory =
                    categoryRepository.findById(categoryId);

            if (optionalCategory.isEmpty()) {
                throw new RuntimeException("Category not found");
            }

            Fish_Category category = optionalCategory.get();

            category.setStatus(UserStatus.INACTIVE);

            categoryRepository.save(category);

        } catch (Exception e) {
            log.error("Error changing category status", e);
            throw e;
        }
    }

    @Override
    public List<Fish_CategoryDTO> filterCategories(String categoryName) {
        log.info("Filter categories");

        try {
            List<Fish_CategoryDTO> categoryDTOList = new ArrayList<>();

            List<Fish_Category> categories =
                    categoryRepository.findByCategoryNameContaining(categoryName);

            for (Fish_Category category : categories) {
                Fish_CategoryDTO categoryDTO = new Fish_CategoryDTO();

                categoryDTO.setId(category.getId());
                categoryDTO.setCategoryName(category.getCategoryName());
                categoryDTO.setDescription(category.getDescription());
                categoryDTO.setStatus(category.getStatus());

                categoryDTOList.add(categoryDTO);
            }

            return categoryDTOList;

        } catch (Exception e) {
            log.error("Error filtering categories", e);
            throw e;
        }
    }
}