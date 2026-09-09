package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Seller;
import lk.ijse.AquariumFish.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SellerRepository extends JpaRepository<Seller, Long> {
    @Query(value = "SELECT * FROM seller WHERE ?1 IS NULL OR seller_name LIKE %1%", nativeQuery = true)
    List<Seller> findByUsernameContaining(String username);
}
