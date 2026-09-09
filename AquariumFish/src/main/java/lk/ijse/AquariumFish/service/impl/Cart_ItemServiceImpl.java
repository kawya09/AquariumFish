package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.AdminDTO;
import lk.ijse.AquariumFish.dto.Cart_ItemDTO;
import lk.ijse.AquariumFish.entity.Admin;
import lk.ijse.AquariumFish.entity.Cart_Item;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.repository.Cart_ItemRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.service.AdminService;
import lk.ijse.AquariumFish.service.Cart_ItemService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
        log.info("Save Cart Item");

        try{
            Role role = roleRepository.findById(cart_itemDTO.getId())
                    .orElseThrow(() -> new RuntimeException( "Cart Item not found " ));

            Cart_Item cart_item= new Cart_Item();
            cart_item.setId(cart_itemDTO.getId());
            cart_item.setQuantity(cart_itemDTO.getQuantity());
            cart_item.setUnitPrice(cart_itemDTO.getUnitPrice());
            cart_item.setStatus(cart_itemDTO.getStatus());
            cartItemRepository.save(cart_item);

        }catch(Exception e){
            log.error("Error saving cart item");
            throw e;
        }

    }

    @Override
    public List<Cart_ItemDTO> getAllCart_Items() {
        try {
            List<Cart_ItemDTO> cartItemDTOList = new ArrayList<>();
            List<Cart_Item> cartItems =cartItemRepository.findAll();
            for (Cart_Item cart_item : cartItems) {
                Cart_ItemDTO cartItemDTO = new Cart_ItemDTO();
                cartItemDTOList.add(cartItemDTO);

            }
            return cartItemDTOList;
        } catch (Exception e) {
            log.error("Error saving cart items");
            throw e;
        }
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
