package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.repository.Cart_ItemRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("v1/admin")
@RestController
public class AdminController {
    private final Cart_ItemRepository cart_ItemRepository;
    private final RoleRepository roleRepository;
    public AdminController(Cart_ItemRepository cart_ItemRepository, RoleRepository roleRepository) {
        this.cart_ItemRepository = cart_ItemRepository;
        this.roleRepository = roleRepository;
    }
}
