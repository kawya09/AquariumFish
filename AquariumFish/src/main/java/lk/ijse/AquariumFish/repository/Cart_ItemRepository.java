package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Cart_Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Cart_ItemRepository extends JpaRepository<Cart_Item,Long> {
}
