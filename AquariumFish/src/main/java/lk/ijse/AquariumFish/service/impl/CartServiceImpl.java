package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.CartDTO;
import lk.ijse.AquariumFish.entity.Cart;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.CartRepository;
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

    public CartServiceImpl(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    @Override
    public void saveCart(CartDTO cartDTO) {
        log.info("Save cart");

        try {
            Cart cart = new Cart();

            cart.setCreatedDate(cartDTO.getCreatedDate());
            cart.setStatus(cartDTO.getStatus());

            cartRepository.save(cart);

        } catch (Exception e) {
            log.error("Error saving cart", e);
            throw e;
        }
    }

    @Override
    public List<CartDTO> getAllCarts() {
        log.info("Get all carts");

        try {
            List<CartDTO> cartDTOList = new ArrayList<>();

            List<Cart> carts = cartRepository.findAll();

            for (Cart cart : carts) {
                CartDTO cartDTO = new CartDTO();

                cartDTO.setId(cart.getId());
                cartDTO.setCreatedDate(cart.getCreatedDate());
                cartDTO.setStatus(cart.getStatus());

                cartDTOList.add(cartDTO);
            }

            return cartDTOList;

        } catch (Exception e) {
            log.error("Error getting all carts", e);
            throw e;
        }
    }

    @Override
    public void updateCart(CartDTO cartDTO) {
        log.info("Update cart");

        try {
            Optional<Cart> optionalCart =
                    cartRepository.findById(cartDTO.getId());

            if (optionalCart.isEmpty()) {
                throw new RuntimeException("Cart not found");
            }

            Cart cart = optionalCart.get();

            cart.setCreatedDate(cartDTO.getCreatedDate());
            cart.setStatus(cartDTO.getStatus());

            cartRepository.save(cart);

        } catch (Exception e) {
            log.error("Error updating cart", e);
            throw e;
        }
    }

    @Override
    public void changeCartStatus(long cartId) {
        log.info("Change cart status");

        try {
            Optional<Cart> optionalCart =
                    cartRepository.findById(cartId);

            if (optionalCart.isEmpty()) {
                throw new RuntimeException("Cart not found");
            }

            Cart cart = optionalCart.get();

            cart.setStatus(UserStatus.INACTIVE);

            cartRepository.save(cart);

        } catch (Exception e) {
            log.error("Error changing cart status", e);
            throw e;
        }
    }

    @Override
    public List<CartDTO> filterCarts(Long id) {
        log.info("Filter carts");

        try {
            List<CartDTO> cartDTOList = new ArrayList<>();

            List<Cart> carts =
                    cartRepository.findByStatusContaining(id);

            for (Cart cart : carts) {
                CartDTO cartDTO = new CartDTO();

                cartDTO.setId(cart.getId());
                cartDTO.setCreatedDate(cart.getCreatedDate());
                cartDTO.setStatus(cart.getStatus());

                cartDTOList.add(cartDTO);
            }

            return cartDTOList;

        } catch (Exception e) {
            log.error("Error filtering carts", e);
            throw e;
        }
    }


}