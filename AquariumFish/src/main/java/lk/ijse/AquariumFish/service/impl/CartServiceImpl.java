package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.CartDTO;
import lk.ijse.AquariumFish.entity.Cart;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.CartRepository;
import lk.ijse.AquariumFish.service.CartService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository repository;

    public CartServiceImpl(CartRepository repository) {
        this.repository = repository;
    }

    @Override
    public void saveCart(CartDTO dto) {

        Cart cart = new Cart();

        cart.setCreatedDate(dto.getCreatedDate());
        cart.setStatus(dto.getStatus());

        repository.save(cart);
    }

    @Override
    public List<CartDTO> getAllCarts() {

        List<CartDTO> list = new ArrayList<>();

        for (Cart cart : repository.findAll()) {

            CartDTO dto = new CartDTO();

            dto.setId(cart.getId());
            dto.setCreatedDate(cart.getCreatedDate());
            dto.setStatus(cart.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public CartDTO getCartById(Long id) {

        Cart cart = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        CartDTO dto = new CartDTO();

        dto.setId(cart.getId());
        dto.setCreatedDate(cart.getCreatedDate());
        dto.setStatus(cart.getStatus());

        return dto;
    }

    @Override
    public void updateCart(CartDTO dto) {

        Cart cart = repository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        cart.setCreatedDate(dto.getCreatedDate());
        cart.setStatus(dto.getStatus());

        repository.save(cart);
    }

    @Override
    public void changeCartStatus(Long id) {

        Cart cart = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cart not found"));

        cart.setStatus(UserStatus.INACTIVE);

        repository.save(cart);
    }
}