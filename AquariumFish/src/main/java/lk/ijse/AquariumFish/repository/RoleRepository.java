package lk.ijse.AquariumFish.repository;

import lk.ijse.AquariumFish.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Collection<Object> findByRoleNameContaining(String roleName);
}
