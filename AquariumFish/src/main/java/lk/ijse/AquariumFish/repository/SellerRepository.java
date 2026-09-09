package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Seller;
import lk.ijse.AquariumFish.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SellerRepository extends JpaRepository<Seller, Long> {
    List<Seller> findByUsernameContaining(String username);
}
