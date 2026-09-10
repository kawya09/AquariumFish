package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Cart_Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface Cart_ItemRepository extends JpaRepository<Cart_Item,Long> {
    List<Cart_Item> findByUsernameContaining(String username);
}
