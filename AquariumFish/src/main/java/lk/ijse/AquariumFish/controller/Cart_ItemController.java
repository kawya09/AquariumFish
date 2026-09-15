package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.Cart_ItemDTO;
import lk.ijse.AquariumFish.service.Cart_ItemService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/CartItem")
@RestController
public class Cart_ItemController {

    private final Cart_ItemService cartItemService;

    public Cart_ItemController(Cart_ItemService cartItemService) {
        this.cartItemService = cartItemService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveCartItem(@RequestBody Cart_ItemDTO cartItemDTO) {
        cartItemService.saveCartItem(cartItemDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllCartItem() {
        List<Cart_ItemDTO> cartItemDTOList = cartItemService.getAllCartItems();
        return new CommonResponse(OPERATION_SUCCESS, cartItemDTOList, SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateCartItem(@RequestBody Cart_ItemDTO cartItemDTO) {
        cartItemService.updateCartItem(cartItemDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteCartItem(@PathVariable Long id) {
        cartItemService.changeCartItemStatus(id);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterCartItem(@RequestParam String status) {
        List<Cart_ItemDTO> cartItemDTOList = cartItemService.filterCartItems(status);
        return new CommonResponse(OPERATION_SUCCESS, cartItemDTOList, SUCCESS_MESSAGE);
    }
}