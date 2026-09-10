package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Cart;
import lk.ijse.AquariumFish.entity.Cart_Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartRepository extends JpaRepository<Cart,Long> {
    List<Cart> findByUsernameContaining(String username);
}
