package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    List<User> findByUsernameStatus(String userStatus);

    List<User> findByUsernameContaining(String username);
}
