package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.CartDTO;

import java.util.List;

public interface CartService {

    void saveCart(CartDTO cartDTO);

    List<CartDTO> getAllCarts();

    void updateCart(CartDTO cartDTO);

    void changeCartStatus(long cartId);

    List<CartDTO> filterCarts(Long id);
}