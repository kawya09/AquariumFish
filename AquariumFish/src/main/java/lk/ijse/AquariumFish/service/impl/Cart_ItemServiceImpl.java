package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.AdminDTO;
import lk.ijse.AquariumFish.dto.Cart_ItemDTO;
import lk.ijse.AquariumFish.entity.Admin;
import lk.ijse.AquariumFish.entity.Cart_Item;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Cart_ItemRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.service.AdminService;
import lk.ijse.AquariumFish.service.Cart_ItemService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
            log.error("Error getting all cart items");
            throw e;
        }
    }

    @Override
    public void updateCart_Item(Cart_ItemDTO cart_itemDTO) {
        log.info("Update Cart Item");
        try{
            Optional<Cart_Item> cart_item = cartItemRepository.findById(cart_itemDTO.getId());
            if(cart_item.isEmpty()){
                throw new RuntimeException( "Cart item not found " );

            }
            Cart_Item cart_item1 = cart_item.get();
            cart_item1.setQuantity(cart_itemDTO.getQuantity());
            cart_item1.setUnitPrice(cart_itemDTO.getUnitPrice());
            cart_item1.setStatus(cart_itemDTO.getStatus());

            Role role = roleRepository.findById(cart_itemDTO.getId()).orElseThrow(() -> new RuntimeException( "Role not found " ));
            Cart_Item cart_item2 =cart_item.get();
            cartItemRepository.save(cart_item1);
        }catch(Exception e){
            log.error("Error updating cart item");
            throw e;
        }


    }

    @Override
    public void changeCart_ItemStatus(long cart_itemId) {
        log.info("Change cart item status");
        try {
            Optional<Cart_Item> cart_item = cartItemRepository.findById(cart_itemId);
            if(cart_item.isEmpty()){
                throw new RuntimeException( "cart item not found " );
            }
            Cart_Item cart_item1 = cart_item.get();
            cart_item1.setStatus(UserStatus.INACTIVE);
            cartItemRepository.save(cart_item1);
        } catch (Exception e) {
            log.error("Error changing cart item status");
            throw e;
        }

    }

    @Override
    public List<Cart_ItemDTO> filterCart_Items(String username) {

        try {
            List<Cart_ItemDTO> cartItemDTOList = new ArrayList<>();
            List<Cart_Item> cartItems = cartItemRepository.findByUsernameContaining((username));
            for (Cart_Item cart_item :cartItems) {
                Cart_ItemDTO cartItemDTO = new Cart_ItemDTO();
                cartItemDTO.setId(cart_item.getId());
                cartItemDTO.setQuantity(cart_item.getQuantity());
                cartItemDTO.setUnitPrice(cart_item.getUnitPrice());
                cartItemDTO.setStatus(cart_item.getStatus());

                cartItemDTOList.add(cartItemDTO);
            }
            return cartItemDTOList;
        } catch (Exception e) {
            log.error("Error filtering cart item");
            throw e;
        }
    }

    @Override
    public void changeCart_ItemRole(long cart_itemID, long roleID) {
        log.info("Change cart item role");
        try {
            Optional<Cart_Item> cart_item = cartItemRepository.findById(cart_itemID);
            if(cart_item.isEmpty()){
                throw new RuntimeException( "cart item not found " );
            }
            Role role = roleRepository.findById(roleID).orElseThrow(() -> new RuntimeException( "Role not found " ));
            Cart_Item cart_item1 = cart_item.get();
            cartItemRepository.save(cart_item1);
        }catch(Exception e){
            log.error("Error changing cart item role");
            throw e;
        }

    }
}
