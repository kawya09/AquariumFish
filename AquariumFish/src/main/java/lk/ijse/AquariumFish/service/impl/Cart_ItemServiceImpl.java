package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Cart_ItemDTO;
import lk.ijse.AquariumFish.repository.Cart_ItemRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.service.AdminService;
import lk.ijse.AquariumFish.service.Cart_ItemService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class Cart_ItemServiceImpl implements Cart_ItemService {
    private final Cart_ItemRepository cartItemRepository;
    private final RoleRepository roleRepository;

    public Cart_ItemServiceImpl(Cart_ItemRepository cartItemRepository,RoleRepository roleRepository) {
        this.cartItemRepository = cartItemRepository;
        this.roleRepository = roleRepository;
    }
    @Override
    public void saveCart_Item(Cart_ItemDTO cart_itemDTO) {

    }

    @Override
    public List<Cart_ItemDTO> getAllCart_Items() {
        return List.of();
    }

    @Override
    public void updateCart_Item(Cart_ItemDTO cart_itemDTO) {

    }

    @Override
    public void changeCart_ItemStatus(long cart_itemDTO) {

    }

    @Override
    public List<Cart_ItemDTO> filterCart_Items(String username) {
        return List.of();
    }

    @Override
    public void changeCart_ItemRole(long cart_itemID, long roleID) {

    }
}
