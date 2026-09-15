package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RoleRepository extends JpaRepository<Role, Long> {

    @Query(value = "SELECT * FROM role WHERE ?1 IS NULL OR role_name LIKE CONCAT('%', ?1, '%')",
            nativeQuery = true)
    List<Role> findByRoleNameContaining(String roleName);

}