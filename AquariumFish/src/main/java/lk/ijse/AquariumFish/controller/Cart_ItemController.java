package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.Cart_ItemDTO;
import lk.ijse.AquariumFish.repository.Cart_ItemRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.service.Cart_ItemService;
import lk.ijse.AquariumFish.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/cart_Item")
@RestController
public class Cart_ItemController {
 private final Cart_ItemService cart_ItemService;
 private final UserService userService;
 public Cart_ItemController(Cart_ItemService cart_ItemService, UserService userService) {
     this.cart_ItemService = cart_ItemService;
     this.userService = userService;
 }
    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveCart_Item(@RequestBody Cart_ItemDTO cart_itemDTO){
        cart_ItemService.saveCart_Item(cart_itemDTO);
        return new CommonResponse(OPERATION_SUCCESS,SUCCESS_MESSAGE);
    }
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllCart_Item(){
        List<Cart_ItemDTO> cartItemDTOList = cart_ItemService.getAllCart_Items();
        return new CommonResponse(OPERATION_SUCCESS,cartItemDTOList,SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateCart_Item(@RequestBody Cart_ItemDTO cart_itemDTO){
        cart_ItemService.updateCart_Item(Cart_ItemDTO);
        return new CommonResponse(OPERATION_SUCCESS,SUCCESS_MESSAGE);

    }

    @DeleteMapping(value = "/filter",produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteCart_Item(@PathVariable Long id){
        cart_ItemService.changeCart_ItemStatus(id);
        return new CommonResponse(OPERATION_SUCCESS,SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter",produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterCart_Item(@RequestParam String Username){
        List<Cart_ItemDTO> cartItemDTOList = cart_ItemService.filterCart_Items(Username) ;
        return new CommonResponse(OPERATION_SUCCESS,cartItemDTOList,SUCCESS_MESSAGE);
    }

}
