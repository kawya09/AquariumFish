package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    @Query(value = "SELECT * FROM delivery WHERE ?1 IS NULL OR tracking_no LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Delivery> findByTrackingNoContaining(String trackingNo);

}