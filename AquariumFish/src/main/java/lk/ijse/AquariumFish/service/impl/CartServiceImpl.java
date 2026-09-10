package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.repository.CartRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.service.CartService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final RoleRepository roleRepository;
    public CartServiceImpl(CartRepository cartRepository, RoleRepository roleRepository) {
        this.cartRepository = cartRepository;
        this.roleRepository = roleRepository;
    }

}
