package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Cart;
import lk.ijse.AquariumFish.entity.Cart_Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart,Long> {
}
