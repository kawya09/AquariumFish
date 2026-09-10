package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.CartDTO;
import lk.ijse.AquariumFish.dto.Cart_ItemDTO;
import lk.ijse.AquariumFish.entity.Cart;
import lk.ijse.AquariumFish.entity.Cart_Item;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.entity.Seller;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.CartRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.service.CartService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final RoleRepository roleRepository;
    public CartServiceImpl(CartRepository cartRepository, RoleRepository roleRepository) {
        this.cartRepository = cartRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void saveCart(CartDTO cartDTO) {
        log.info("Saving cart");

        try {
            Role role = roleRepository.findById(cartDTO.getId())
                    .orElseThrow(() -> new RuntimeException( "cart not found " ));
            Cart cart = new Cart();
            cart.setStatus(cartDTO.getStatus());
            cart.setCreatedDate(cartDTO.getCreatedDate());

            cartRepository.save(cart);
        }catch (Exception e){
            log.error("Error saving cart",e);
            throw e;
        }
    }

    @Override
    public List<CartDTO> getAllCarts() {
        try {
            List<CartDTO> cartDTOList = new ArrayList<>();
            List<Cart> carts =cartRepository.findAll();
            for (Cart cart : carts) {
                CartDTO cartDTO = new CartDTO();

                cartDTO.setId(cart.getId());
                cartDTO.setStatus(cart.getStatus());
                cartDTO.setCreatedDate(cart.getCreatedDate());
                cartDTOList.add(cartDTO);
            }
            return cartDTOList;
        } catch (Exception e) {
            log.error("Error getting all carts");
            throw e;
        }
    }

    @Override
    public void updateCart(CartDTO cartDTO) {
        log.info("Update Cart ");
        try{
            Optional<Cart> cart = cartRepository.findById(cartDTO.getId());
            if(cart.isEmpty()){
                throw new RuntimeException( "Cart  not found " );

            }
            Cart cart1 = cart.get();
            cart1.setCreatedDate(cartDTO.getCreatedDate());
            cart1.setStatus(cartDTO.getStatus());

            Role role = roleRepository.findById(cartDTO.getId()).orElseThrow(() -> new RuntimeException( "Role not found " ));
            Cart cart2 =cart.get();
            cartRepository.save(cart1);
        }catch(Exception e){
            log.error("Error updating cart ");
            throw e;
        }

    }

    @Override
    public void changeCartStatus(long cartId) {
        log.info("Change cart  status");
        try {
            Optional<Cart> cart = cartRepository.findById(cartId);
            if(cart.isEmpty()){
                throw new RuntimeException( "cart not found " );
            }
            Cart cart1 = cart.get();
            cart1.setStatus(UserStatus.INACTIVE);
            cartRepository.save(cart1);
        } catch (Exception e) {
            log.error("Error changing cart status");
            throw e;
        }

    }

    @Override
    public List<CartDTO> filterCarts(String username) {
        try {
            List<CartDTO> cartDTOList = new ArrayList<>();
            List<Cart> carts = cartRepository.findByUsernameContaining((username));
            for (Cart cart :carts) {
                CartDTO cartDTO = new CartDTO();
                cartDTO.setId(cart.getId());
                cartDTO.setCreatedDate(cartDTO.getCreatedDate());
                cartDTO.setStatus(cart.getStatus());

                cartDTOList.add(cartDTO);
            }
            return cartDTOList;
        } catch (Exception e) {
            log.error("Error filtering cart ");
            throw e;
        }
    }

    @Override
    public void changeCartRole(long cartID, long roleID) {
        log.info("Change cart  role");
        try {
            Optional<Cart> cart = cartRepository.findById(cartID);
            if(cart.isEmpty()){
                throw new RuntimeException( "cart  not found " );
            }
            Role role = roleRepository.findById(roleID).orElseThrow(() -> new RuntimeException( "Role not found " ));
            Cart cart1 = cart.get();
            cartRepository.save(cart1);
        }catch(Exception e){
            log.error("Error changing cart item role");
            throw e;
        }


    }
}
