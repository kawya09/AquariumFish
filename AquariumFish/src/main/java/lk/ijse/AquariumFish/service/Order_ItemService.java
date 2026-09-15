package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.Order_ItemDTO;

import java.util.List;

public interface Order_ItemService {

    void saveOrderItem(Order_ItemDTO orderItemDTO);

    List<Order_ItemDTO> getAllOrderItems();

    void updateOrderItem(Order_ItemDTO orderItemDTO);

    void changeOrderItemStatus(long orderItemId);

    List<Order_ItemDTO> filterOrderItems(Long id);
}