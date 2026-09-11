package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.service.DeliveryService;
import lk.ijse.AquariumFish.service.UserService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("v1/delivery")
@RestController
public class DeliveryController {
    private DeliveryService deliveryService;
    private UserService userService;
    public DeliveryController(DeliveryService deliveryService, UserService userService) {
        this.deliveryService = deliveryService;
        this.userService = userService;
    }
}
