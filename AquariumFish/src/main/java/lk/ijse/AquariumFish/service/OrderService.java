package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.OrderDTO;

import java.util.List;

public interface OrderService {

    void saveOrder(OrderDTO dto);

    List<OrderDTO> getAllOrders();

    OrderDTO getOrderById(Long id);

    void updateOrder(OrderDTO dto);

    void changeOrderStatus(Long id);

    List<OrderDTO> filterOrders(String status);
}