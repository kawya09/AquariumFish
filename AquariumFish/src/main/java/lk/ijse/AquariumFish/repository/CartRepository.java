package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CartRepository extends JpaRepository<Cart, Long> {

    @Query(value = "SELECT * FROM cart WHERE ?1 IS NULL OR status LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Cart> findByStatusContaining(String status);

}