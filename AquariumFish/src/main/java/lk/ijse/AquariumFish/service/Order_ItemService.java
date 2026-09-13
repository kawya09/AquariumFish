package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Order_ItemDTO;

import java.util.List;

public interface Order_ItemService {

    void saveOrderItem(Order_ItemDTO dto);

    List<Order_ItemDTO> getAllOrderItems();

    Order_ItemDTO getOrderItemById(Long id);

    void updateOrderItem(Order_ItemDTO dto);

    void changeOrderItemStatus(Long id);
}