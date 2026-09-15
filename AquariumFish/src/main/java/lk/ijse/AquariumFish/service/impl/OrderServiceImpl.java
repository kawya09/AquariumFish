package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.OrderDTO;
import lk.ijse.AquariumFish.entity.Order;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.OrderRepository;
import lk.ijse.AquariumFish.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    public OrderServiceImpl(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public void saveOrder(OrderDTO orderDTO) {
        log.info("Save order");

        try {
            Order order = new Order();

            order.setOrderDate(orderDTO.getOrderDate());
            order.setTotalAmount(orderDTO.getTotalAmount());
            order.setStatus(orderDTO.getStatus());

            orderRepository.save(order);

        } catch (Exception e) {
            log.error("Error saving order", e);
            throw e;
        }
    }

    @Override
    public List<OrderDTO> getAllOrders() {
        log.info("Get all orders");

        try {
            List<OrderDTO> orderDTOList = new ArrayList<>();

            List<Order> orders = orderRepository.findAll();

            for (Order order : orders) {
                OrderDTO orderDTO = new OrderDTO();

                orderDTO.setId(order.getId());
                orderDTO.setOrderDate(order.getOrderDate());
                orderDTO.setTotalAmount(order.getTotalAmount());
                orderDTO.setStatus(order.getStatus());

                orderDTOList.add(orderDTO);
            }

            return orderDTOList;

        } catch (Exception e) {
            log.error("Error getting all orders", e);
            throw e;
        }
    }

    @Override
    public void updateOrder(OrderDTO orderDTO) {
        log.info("Update order");

        try {
            Optional<Order> optionalOrder =
                    orderRepository.findById(orderDTO.getId());

            if (optionalOrder.isEmpty()) {
                throw new RuntimeException("Order not found");
            }

            Order order = optionalOrder.get();

            order.setOrderDate(orderDTO.getOrderDate());
            order.setTotalAmount(orderDTO.getTotalAmount());
            order.setStatus(orderDTO.getStatus());

            orderRepository.save(order);

        } catch (Exception e) {
            log.error("Error updating order", e);
            throw e;
        }
    }

    @Override
    public void changeOrderStatus(long orderId) {
        log.info("Change order status");

        try {
            Optional<Order> optionalOrder =
                    orderRepository.findById(orderId);

            if (optionalOrder.isEmpty()) {
                throw new RuntimeException("Order not found");
            }

            Order order = optionalOrder.get();

            order.setStatus(UserStatus.INACTIVE);

            orderRepository.save(order);

        } catch (Exception e) {
            log.error("Error changing order status", e);
            throw e;
        }
    }

    @Override
    public List<OrderDTO> filterOrders(Long id) {
            log.info("Filter orders");

            try {
                List<OrderDTO> orderDTOList = new ArrayList<>();

                List<Order> orders =
                        orderRepository.findByStatusContaining(id);

                for (Order order : orders) {
                    OrderDTO orderDTO = new OrderDTO();

                    orderDTO.setId(order.getId());
                    orderDTO.setOrderDate(order.getOrderDate());
                    orderDTO.setTotalAmount(order.getTotalAmount());
                    orderDTO.setStatus(order.getStatus());

                    orderDTOList.add(orderDTO);
                }

                return orderDTOList;

            } catch (Exception e) {
                log.error("Error filtering orders", e);
                throw e;
            }
        }
    }

