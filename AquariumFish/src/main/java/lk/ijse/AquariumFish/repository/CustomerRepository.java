package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    @Query(value = "SELECT * FROM customer WHERE ?1 IS NULL OR first_name LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Customer> findByFirstNameContaining(String firstName);

}