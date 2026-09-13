package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Fish_CategoryDTO;
import lk.ijse.AquariumFish.entity.Fish_Category;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Fish_CategoryRepository;
import lk.ijse.AquariumFish.service.Fish_CategoryService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class Fish_CategoryServiceImpl implements Fish_CategoryService {

    private final Fish_CategoryRepository repository;

    public Fish_CategoryServiceImpl(Fish_CategoryRepository repository) {
        this.repository = repository;
    }

    @Override
    public void saveCategory(Fish_CategoryDTO dto) {

        Fish_Category category = new Fish_Category();

        category.setCategoryName(dto.getCategoryName());
        category.setDescription(dto.getDescription());
        category.setStatus(dto.getStatus());

        repository.save(category);
    }

    @Override
    public List<Fish_CategoryDTO> getAllCategories() {

        List<Fish_CategoryDTO> list = new ArrayList<>();

        for (Fish_Category category : repository.findAll()) {

            Fish_CategoryDTO dto = new Fish_CategoryDTO();

            dto.setId(category.getId());
            dto.setCategoryName(category.getCategoryName());
            dto.setDescription(category.getDescription());
            dto.setStatus(category.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public Fish_CategoryDTO getCategoryById(Long id) {

        Fish_Category category = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        Fish_CategoryDTO dto = new Fish_CategoryDTO();

        dto.setId(category.getId());
        dto.setCategoryName(category.getCategoryName());
        dto.setDescription(category.getDescription());
        dto.setStatus(category.getStatus());

        return dto;
    }

    @Override
    public void updateCategory(Fish_CategoryDTO dto) {

        Fish_Category category = repository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        category.setCategoryName(dto.getCategoryName());
        category.setDescription(dto.getDescription());
        category.setStatus(dto.getStatus());

        repository.save(category);
    }

    @Override
    public void changeCategoryStatus(Long id) {

        Fish_Category category = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Category not found"));

        category.setStatus(UserStatus.INACTIVE);

        repository.save(category);
    }

    @Override
    public List<Fish_CategoryDTO> filterCategories(String categoryName) {

        List<Fish_CategoryDTO> list = new ArrayList<>();

        for (Fish_Category category :
                repository.findByCategoryNameContaining(categoryName)) {

            Fish_CategoryDTO dto = new Fish_CategoryDTO();

            dto.setId(category.getId());
            dto.setCategoryName(category.getCategoryName());
            dto.setDescription(category.getDescription());
            dto.setStatus(category.getStatus());

            list.add(dto);
        }

        return list;
    }
}