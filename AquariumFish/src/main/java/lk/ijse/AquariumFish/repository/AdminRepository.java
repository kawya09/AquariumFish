package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin,Long> {
}
