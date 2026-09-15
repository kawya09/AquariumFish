package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Order_ItemDTO;
import lk.ijse.AquariumFish.entity.Order_Item;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Order_ItemRepository;
import lk.ijse.AquariumFish.service.Order_ItemService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class Order_ItemServiceImpl implements Order_ItemService {

    private final Order_ItemRepository orderItemRepository;

    public Order_ItemServiceImpl(Order_ItemRepository orderItemRepository) {
        this.orderItemRepository = orderItemRepository;
    }

    @Override
    public void saveOrderItem(Order_ItemDTO orderItemDTO) {
        log.info("Save order item");

        try {
            Order_Item orderItem = new Order_Item();

            orderItem.setQuantity(orderItemDTO.getQuantity());
            orderItem.setUnitPrice(orderItemDTO.getUnitPrice());
            orderItem.setSubtotal(orderItemDTO.getSubtotal());
            orderItem.setStatus(orderItemDTO.getStatus());

            orderItemRepository.save(orderItem);

        } catch (Exception e) {
            log.error("Error saving order item", e);
            throw e;
        }
    }

    @Override
    public List<Order_ItemDTO> getAllOrderItems() {
        log.info("Get all order items");

        try {
            List<Order_ItemDTO> orderItemDTOList = new ArrayList<>();

            List<Order_Item> orderItems =
                    orderItemRepository.findAll();

            for (Order_Item orderItem : orderItems) {
                Order_ItemDTO orderItemDTO = new Order_ItemDTO();

                orderItemDTO.setId(orderItem.getId());
                orderItemDTO.setQuantity(orderItem.getQuantity());
                orderItemDTO.setUnitPrice(orderItem.getUnitPrice());
                orderItemDTO.setSubtotal(orderItem.getSubtotal());
                orderItemDTO.setStatus(orderItem.getStatus());

                orderItemDTOList.add(orderItemDTO);
            }

            return orderItemDTOList;

        } catch (Exception e) {
            log.error("Error getting all order items", e);
            throw e;
        }
    }

    @Override
    public void updateOrderItem(Order_ItemDTO orderItemDTO) {
        log.info("Update order item");

        try {
            Optional<Order_Item> optionalOrderItem =
                    orderItemRepository.findById(orderItemDTO.getId());

            if (optionalOrderItem.isEmpty()) {
                throw new RuntimeException("Order item not found");
            }

            Order_Item orderItem = optionalOrderItem.get();

            orderItem.setQuantity(orderItemDTO.getQuantity());
            orderItem.setUnitPrice(orderItemDTO.getUnitPrice());
            orderItem.setSubtotal(orderItemDTO.getSubtotal());
            orderItem.setStatus(orderItemDTO.getStatus());

            orderItemRepository.save(orderItem);

        } catch (Exception e) {
            log.error("Error updating order item", e);
            throw e;
        }
    }

    @Override
    public void changeOrderItemStatus(long orderItemId) {
        log.info("Change order item status");

        try {
            Optional<Order_Item> optionalOrderItem =
                    orderItemRepository.findById(orderItemId);

            if (optionalOrderItem.isEmpty()) {
                throw new RuntimeException("Order item not found");
            }

            Order_Item orderItem = optionalOrderItem.get();

            orderItem.setStatus(UserStatus.INACTIVE);

            orderItemRepository.save(orderItem);

        } catch (Exception e) {
            log.error("Error changing order item status", e);
            throw e;
        }
    }

    @Override
    public List<Order_ItemDTO> filterOrderItems(String status) {
        log.info("Filter order items");

        try {
            List<Order_ItemDTO> orderItemDTOList = new ArrayList<>();

            List<Order_Item> orderItems =
                    orderItemRepository.findByStatusContaining(status);

            for (Order_Item orderItem : orderItems) {
                Order_ItemDTO orderItemDTO = new Order_ItemDTO();

                orderItemDTO.setId(orderItem.getId());
                orderItemDTO.setQuantity(orderItem.getQuantity());
                orderItemDTO.setUnitPrice(orderItem.getUnitPrice());
                orderItemDTO.setSubtotal(orderItem.getSubtotal());
                orderItemDTO.setStatus(orderItem.getStatus());

                orderItemDTOList.add(orderItemDTO);
            }

            return orderItemDTOList;

        } catch (Exception e) {
            log.error("Error filtering order items", e);
            throw e;
        }
    }
}