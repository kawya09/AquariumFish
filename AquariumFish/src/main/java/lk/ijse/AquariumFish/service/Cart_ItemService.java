package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Cart_ItemDTO;

import java.util.List;

public interface Cart_ItemService {

    void saveCartItem(Cart_ItemDTO dto);

    List<Cart_ItemDTO> getAllCartItems();

    Cart_ItemDTO getCartItemById(Long id);

    void updateCartItem(Cart_ItemDTO dto);

    void changeCartItemStatus(Long id);
}