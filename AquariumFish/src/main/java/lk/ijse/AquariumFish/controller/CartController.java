package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.CartDTO;
import lk.ijse.AquariumFish.dto.Cart_ItemDTO;
import lk.ijse.AquariumFish.service.CartService;
import lk.ijse.AquariumFish.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/cart")
@RestController
public class CartController {
    private CartService cartService;
    private UserService userService;
    public CartController(CartService cartService, UserService userService) {
        this.cartService = cartService;
        this.userService = userService;
    }
    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveCart(@RequestBody CartDTO cartDTO){
        cartService.saveCart(cartDTO);
        return new CommonResponse(OPERATION_SUCCESS,SUCCESS_MESSAGE);
    }
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllCart(){
        List<CartDTO> cartDTOList = cartService.getAllCarts();
        return new CommonResponse(OPERATION_SUCCESS,cartDTOList,SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateCart(@RequestBody CartDTO cartDTO){
        cartService.updateCart(cartDTO);
        return new CommonResponse(OPERATION_SUCCESS,SUCCESS_MESSAGE);

    }

    @DeleteMapping(value = "/filter",produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteCart(@PathVariable Long id){
        cartService.changeCartStatus(id);
        return new CommonResponse(OPERATION_SUCCESS,SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter",produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterCart(@RequestParam String Username){
        List<CartDTO> cartDTOList = cartService.filterCarts(Username) ;
        return new CommonResponse(OPERATION_SUCCESS,cartDTOList,SUCCESS_MESSAGE);
    }
}
