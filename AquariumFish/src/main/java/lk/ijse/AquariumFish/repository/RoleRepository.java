package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoleRepository extends JpaRepository<Role, Long> {

    List<Role> findByRoleNameContaining(String roleName);

}