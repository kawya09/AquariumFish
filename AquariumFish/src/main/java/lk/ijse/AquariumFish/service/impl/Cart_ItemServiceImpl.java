package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Cart_ItemDTO;
import lk.ijse.AquariumFish.entity.Cart_Item;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Cart_ItemRepository;
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

    public Cart_ItemServiceImpl(Cart_ItemRepository cartItemRepository) {
        this.cartItemRepository = cartItemRepository;
    }

    @Override
    public void saveCartItem(Cart_ItemDTO cartItemDTO) {
        log.info("Save cart item");

        try {
            Cart_Item cartItem = new Cart_Item();

            cartItem.setQuantity(cartItemDTO.getQuantity());
            cartItem.setUnitPrice(cartItemDTO.getUnitPrice());
            cartItem.setStatus(cartItemDTO.getStatus());

            cartItemRepository.save(cartItem);

        } catch (Exception e) {
            log.error("Error saving cart item", e);
            throw e;
        }
    }

    @Override
    public List<Cart_ItemDTO> getAllCartItems() {
        log.info("Get all cart items");

        try {
            List<Cart_ItemDTO> cartItemDTOList = new ArrayList<>();

            List<Cart_Item> cartItems =
                    cartItemRepository.findAll();

            for (Cart_Item cartItem : cartItems) {
                Cart_ItemDTO cartItemDTO = new Cart_ItemDTO();

                cartItemDTO.setId(cartItem.getId());
                cartItemDTO.setQuantity(cartItem.getQuantity());
                cartItemDTO.setUnitPrice(cartItem.getUnitPrice());
                cartItemDTO.setStatus(cartItem.getStatus());

                cartItemDTOList.add(cartItemDTO);
            }

            return cartItemDTOList;

        } catch (Exception e) {
            log.error("Error getting all cart items", e);
            throw e;
        }
    }

    @Override
    public void updateCartItem(Cart_ItemDTO cartItemDTO) {
        log.info("Update cart item");

        try {
            Optional<Cart_Item> optionalCartItem =
                    cartItemRepository.findById(cartItemDTO.getId());

            if (optionalCartItem.isEmpty()) {
                throw new RuntimeException("Cart item not found");
            }

            Cart_Item cartItem = optionalCartItem.get();

            cartItem.setQuantity(cartItemDTO.getQuantity());
            cartItem.setUnitPrice(cartItemDTO.getUnitPrice());
            cartItem.setStatus(cartItemDTO.getStatus());

            cartItemRepository.save(cartItem);

        } catch (Exception e) {
            log.error("Error updating cart item", e);
            throw e;
        }
    }

    @Override
    public void changeCartItemStatus(long cartItemId) {
        log.info("Change cart item status");

        try {
            Optional<Cart_Item> optionalCartItem =
                    cartItemRepository.findById(cartItemId);

            if (optionalCartItem.isEmpty()) {
                throw new RuntimeException("Cart item not found");
            }

            Cart_Item cartItem = optionalCartItem.get();

            cartItem.setStatus(UserStatus.INACTIVE);

            cartItemRepository.save(cartItem);

        } catch (Exception e) {
            log.error("Error changing cart item status", e);
            throw e;
        }
    }

    @Override
    public List<Cart_ItemDTO> filterCartItems(Long id) {
        log.info("Filter cart items");

        try {
            List<Cart_ItemDTO> cartItemDTOList = new ArrayList<>();

            List<Cart_Item> cartItems =
                    cartItemRepository.findByStatusContaining( id);

            for (Cart_Item cartItem : cartItems) {
                Cart_ItemDTO cartItemDTO = new Cart_ItemDTO();

                cartItemDTO.setId(cartItem.getId());
                cartItemDTO.setQuantity(cartItem.getQuantity());
                cartItemDTO.setUnitPrice(cartItem.getUnitPrice());
                cartItemDTO.setStatus(cartItem.getStatus());

                cartItemDTOList.add(cartItemDTO);
            }

            return cartItemDTOList;

        } catch (Exception e) {
            log.error("Error filtering cart items", e);
            throw e;
        }
    }
    }



