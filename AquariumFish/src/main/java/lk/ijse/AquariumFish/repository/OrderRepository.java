package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query(value = "SELECT * FROM orders WHERE ?1 IS NULL OR status LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Order> findByStatusContaining(Long id);

}