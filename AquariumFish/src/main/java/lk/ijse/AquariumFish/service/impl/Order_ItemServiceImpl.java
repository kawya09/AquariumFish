package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.Order_ItemDTO;
import lk.ijse.AquariumFish.entity.Order_Item;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.Order_ItemRepository;
import lk.ijse.AquariumFish.service.Order_ItemService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class Order_ItemServiceImpl implements Order_ItemService {

    private final Order_ItemRepository repository;

    public Order_ItemServiceImpl(Order_ItemRepository repository) {
        this.repository = repository;
    }

    @Override
    public void saveOrderItem(Order_ItemDTO dto) {

        Order_Item item = new Order_Item();

        item.setQuantity(dto.getQuantity());
        item.setUnitPrice(dto.getUnitPrice());
        item.setSubtotal(dto.getSubtotal());
        item.setStatus(dto.getStatus());

        repository.save(item);
    }

    @Override
    public List<Order_ItemDTO> getAllOrderItems() {

        List<Order_ItemDTO> list = new ArrayList<>();

        for (Order_Item item : repository.findAll()) {

            Order_ItemDTO dto = new Order_ItemDTO();

            dto.setId(item.getId());
            dto.setQuantity(item.getQuantity());
            dto.setUnitPrice(item.getUnitPrice());
            dto.setSubtotal(item.getSubtotal());
            dto.setStatus(item.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public Order_ItemDTO getOrderItemById(Long id) {

        Order_Item item = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order item not found"));

        Order_ItemDTO dto = new Order_ItemDTO();

        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setSubtotal(item.getSubtotal());
        dto.setStatus(item.getStatus());

        return dto;
    }

    @Override
    public void updateOrderItem(Order_ItemDTO dto) {

        Order_Item item = repository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Order item not found"));

        item.setQuantity(dto.getQuantity());
        item.setUnitPrice(dto.getUnitPrice());
        item.setSubtotal(dto.getSubtotal());
        item.setStatus(dto.getStatus());

        repository.save(item);
    }

    @Override
    public void changeOrderItemStatus(Long id) {

        Order_Item item = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order item not found"));

        item.setStatus(UserStatus.INACTIVE);

        repository.save(item);
    }
}