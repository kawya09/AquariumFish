package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Cart_ItemDTO;

import java.util.List;

public interface Cart_ItemService {

    void saveCartItem(Cart_ItemDTO cartItemDTO);

    List<Cart_ItemDTO> getAllCartItems();

    void updateCartItem(Cart_ItemDTO cartItemDTO);

    void changeCartItemStatus(long cartItemId);

    List<Cart_ItemDTO> filterCartItems(Long id);
}