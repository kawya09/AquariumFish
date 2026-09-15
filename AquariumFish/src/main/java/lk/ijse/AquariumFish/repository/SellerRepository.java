package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SellerRepository extends JpaRepository<Seller, Long> {

    @Query(value = "SELECT * FROM seller WHERE ?1 IS NULL OR shop_name LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Seller> findByShopNameContaining(String shopName);

}