package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
