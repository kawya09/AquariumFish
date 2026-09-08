package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer,Long> {
}
