package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Order_Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface Order_ItemRepository extends JpaRepository<Order_Item, Long> {
}
