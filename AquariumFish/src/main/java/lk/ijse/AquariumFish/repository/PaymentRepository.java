package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByPaymentMethodContaining(String paymentMethod);
}
