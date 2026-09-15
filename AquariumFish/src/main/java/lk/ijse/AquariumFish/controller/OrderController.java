package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.OrderDTO;
import lk.ijse.AquariumFish.service.OrderService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/Order")
@RestController
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveOrder(@RequestBody OrderDTO orderDTO) {
        orderService.saveOrder(orderDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllOrder() {
        List<OrderDTO> orderDTOList = orderService.getAllOrders();
        return new CommonResponse(OPERATION_SUCCESS, orderDTOList, SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateOrder(@RequestBody OrderDTO orderDTO) {
        orderService.updateOrder(orderDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteOrder(@PathVariable Long id) {
        orderService.changeOrderStatus(id);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterOrder(@RequestParam String status) {
        List<OrderDTO> orderDTOList = orderService.filterOrders(status);
        return new CommonResponse(OPERATION_SUCCESS, orderDTOList, SUCCESS_MESSAGE);
    }
}