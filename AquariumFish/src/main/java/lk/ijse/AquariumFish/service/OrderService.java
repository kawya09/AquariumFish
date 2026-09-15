package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.OrderDTO;

import java.util.List;

public interface OrderService {

    void saveOrder(OrderDTO orderDTO);

    List<OrderDTO> getAllOrders();

    void updateOrder(OrderDTO orderDTO);

    void changeOrderStatus(long orderId);

    List<OrderDTO> filterOrders(Long id);
}