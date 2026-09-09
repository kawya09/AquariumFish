package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByUsernameContaining(String username);
}
