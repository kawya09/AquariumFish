package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    @Query(value = "SELECT * FROM user WHERE ?1 IS NULL OR username LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<User> findByUsernameContaining(String username);

}