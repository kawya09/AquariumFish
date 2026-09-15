package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.Order_ItemDTO;
import lk.ijse.AquariumFish.service.Order_ItemService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/OrderItem")
@RestController
public class Order_ItemController {

    private final Order_ItemService orderItemService;

    public Order_ItemController(Order_ItemService orderItemService) {
        this.orderItemService = orderItemService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveOrderItem(@RequestBody Order_ItemDTO orderItemDTO) {
        orderItemService.saveOrderItem(orderItemDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllOrderItem() {
        List<Order_ItemDTO> orderItemDTOList = orderItemService.getAllOrderItems();
        return new CommonResponse(OPERATION_SUCCESS, orderItemDTOList, SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateOrderItem(@RequestBody Order_ItemDTO orderItemDTO) {
        orderItemService.updateOrderItem(orderItemDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteOrderItem(@PathVariable Long id) {
        orderItemService.changeOrderItemStatus(id);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterOrderItem(@RequestParam String status) {
        List<Order_ItemDTO> orderItemDTOList = orderItemService.filterOrderItems(status);
        return new CommonResponse(OPERATION_SUCCESS, orderItemDTOList, SUCCESS_MESSAGE);
    }
}