package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.AdminDTO;
import lk.ijse.AquariumFish.dto.Cart_ItemDTO;
import lk.ijse.AquariumFish.entity.Cart_Item;

import java.util.List;

public interface Cart_ItemService {
    void saveCart_Item(Cart_ItemDTO cart_itemDTO);

    List<Cart_ItemDTO> getAllCart_Items();

    void updateCart_Item(Cart_ItemDTO cart_itemDTO);

    void changeCart_ItemStatus(long cart_itemDTO);

    List<Cart_ItemDTO> filterCart_Items(String username);

    void changeCart_ItemRole(long cart_itemID, long roleID);
}
