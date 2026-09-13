package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.OrderDTO;
import lk.ijse.AquariumFish.entity.Order;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.OrderRepository;
import lk.ijse.AquariumFish.service.OrderService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository repository;

    public OrderServiceImpl(OrderRepository repository) {
        this.repository = repository;
    }

    @Override
    public void saveOrder(OrderDTO dto) {

        Order order = new Order();

        order.setOrderDate(dto.getOrderDate());
        order.setTotalAmount(dto.getTotalAmount());
        order.setStatus(dto.getStatus());

        repository.save(order);
    }

    @Override
    public List<OrderDTO> getAllOrders() {

        List<OrderDTO> list = new ArrayList<>();

        for (Order order : repository.findAll()) {

            OrderDTO dto = new OrderDTO();

            dto.setId(order.getId());
            dto.setOrderDate(order.getOrderDate());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setStatus(order.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public OrderDTO getOrderById(Long id) {

        Order order = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        OrderDTO dto = new OrderDTO();

        dto.setId(order.getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());

        return dto;
    }

    @Override
    public void updateOrder(OrderDTO dto) {

        Order order = repository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        order.setOrderDate(dto.getOrderDate());
        order.setTotalAmount(dto.getTotalAmount());
        order.setStatus(dto.getStatus());

        repository.save(order);
    }

    @Override
    public void changeOrderStatus(Long id) {

        Order order = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        order.setStatus(UserStatus.INACTIVE);

        repository.save(order);
    }

    @Override
    public List<OrderDTO> filterOrders(String status) {

        List<OrderDTO> list = new ArrayList<>();

        for (Order order :
                repository.findByStatus(UserStatus.valueOf(status))) {

            OrderDTO dto = new OrderDTO();

            dto.setId(order.getId());
            dto.setOrderDate(order.getOrderDate());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setStatus(order.getStatus());

            list.add(dto);
        }

        return list;
    }
}