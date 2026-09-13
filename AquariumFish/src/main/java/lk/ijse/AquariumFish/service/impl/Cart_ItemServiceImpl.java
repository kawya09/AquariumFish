package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Cart_ItemDTO;
import lk.ijse.AquariumFish.entity.Cart_Item;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Cart_ItemRepository;
import lk.ijse.AquariumFish.service.Cart_ItemService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class Cart_ItemServiceImpl implements Cart_ItemService {

    private final Cart_ItemRepository repository;

    public Cart_ItemServiceImpl(Cart_ItemRepository repository) {
        this.repository = repository;
    }

    @Override
    public void saveCartItem(Cart_ItemDTO dto) {

        Cart_Item item = new Cart_Item();

        item.setQuantity(dto.getQuantity());
        item.setUnitPrice(dto.getUnitPrice());
        item.setStatus(dto.getStatus());

        repository.save(item);
    }

    @Override
    public List<Cart_ItemDTO> getAllCartItems() {

        List<Cart_ItemDTO> list = new ArrayList<>();

        for (Cart_Item item : repository.findAll()) {

            Cart_ItemDTO dto = new Cart_ItemDTO();

            dto.setId(item.getId());
            dto.setQuantity(item.getQuantity());
            dto.setUnitPrice(item.getUnitPrice());
            dto.setStatus(item.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public Cart_ItemDTO getCartItemById(Long id) {

        Cart_Item item = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found"));

        Cart_ItemDTO dto = new Cart_ItemDTO();

        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setStatus(item.getStatus());

        return dto;
    }

    @Override
    public void updateCartItem(Cart_ItemDTO dto) {

        Cart_Item item = repository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found"));

        item.setQuantity(dto.getQuantity());
        item.setUnitPrice(dto.getUnitPrice());
        item.setStatus(dto.getStatus());

        repository.save(item);
    }

    @Override
    public void changeCartItemStatus(Long id) {

        Cart_Item item = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cart item not found"));

        item.setStatus(UserStatus.INACTIVE);

        repository.save(item);
    }
}