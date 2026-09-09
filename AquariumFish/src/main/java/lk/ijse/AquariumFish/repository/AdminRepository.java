package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AdminRepository extends JpaRepository<Admin,Long> {
    @Query(value = "SELECT * FROM admin WHERE ?1 IS NULL OR admin_name LIKE %1%", nativeQuery = true)
    List<Admin> findByUsernameContaining(String username);
}
