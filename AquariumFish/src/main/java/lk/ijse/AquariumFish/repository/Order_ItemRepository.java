package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Order_Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface Order_ItemRepository extends JpaRepository<Order_Item, Long> {

    @Query(value = "SELECT * FROM order_item WHERE ?1 IS NULL OR status LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Order_Item> findByStatusContaining(Long id);

}