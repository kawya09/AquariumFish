package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.CartDTO;
import lk.ijse.AquariumFish.dto.Cart_ItemDTO;

import java.util.List;

public interface CartService {
    void saveCart(CartDTO cartDTO);

    List<CartDTO> getAllCarts();

    void updateCart(CartDTO cartDTO);

    void changeCartStatus(long cartDTO);

    List<CartDTO> filterCarts(String username);

    void changeCartRole(long cartID, long roleID);
}
