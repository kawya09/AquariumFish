package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query(value = "SELECT * FROM payment WHERE ?1 IS NULL OR payment_method LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Payment> findByPaymentMethodContaining(String paymentMethod);

}