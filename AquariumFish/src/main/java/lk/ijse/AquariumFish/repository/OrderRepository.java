package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatusContaining(Long id);
}
