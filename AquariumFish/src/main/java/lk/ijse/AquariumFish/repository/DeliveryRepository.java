package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    List<Delivery> findByUsernameContaining(String username);
}
