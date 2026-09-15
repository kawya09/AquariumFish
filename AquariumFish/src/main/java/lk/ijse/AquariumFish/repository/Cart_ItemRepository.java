package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Cart_Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface Cart_ItemRepository extends JpaRepository<Cart_Item, Long> {

    @Query(value = "SELECT * FROM cart_item WHERE ?1 IS NULL OR status LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Cart_Item> findByStatusContaining(Long id);

}