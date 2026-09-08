package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
