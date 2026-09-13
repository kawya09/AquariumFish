package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.CartDTO;

import java.util.List;

public interface CartService {

    void saveCart(CartDTO dto);

    List<CartDTO> getAllCarts();

    CartDTO getCartById(Long id);

    void updateCart(CartDTO dto);

    void changeCartStatus(Long id);
}