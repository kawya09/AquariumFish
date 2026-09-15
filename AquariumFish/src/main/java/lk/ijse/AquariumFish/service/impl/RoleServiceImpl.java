package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.RoleDTO;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.service.RoleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void saveRole(RoleDTO roleDTO) {
        log.info("Save role");

        try {
            Role role = new Role();

            role.setRoleName(roleDTO.getRoleName());
            role.setStatus(roleDTO.getStatus());

            roleRepository.save(role);

        } catch (Exception e) {
            log.error("Error saving role", e);
            throw e;
        }
    }

    @Override
    public List<RoleDTO> getAllRoles() {
        log.info("Get all roles");

        try {
            List<RoleDTO> roleDTOList = new ArrayList<>();

            List<Role> roles = roleRepository.findAll();

            for (Role role : roles) {
                RoleDTO roleDTO = new RoleDTO();

                roleDTO.setId(role.getId());
                roleDTO.setRoleName(role.getRoleName());
                roleDTO.setStatus(role.getStatus());

                roleDTOList.add(roleDTO);
            }

            return roleDTOList;

        } catch (Exception e) {
            log.error("Error getting all roles", e);
            throw e;
        }
    }

    @Override
    public void updateRole(RoleDTO roleDTO) {
        log.info("Update role");

        try {
            Optional<Role> optionalRole =
                    roleRepository.findById(roleDTO.getId());

            if (optionalRole.isEmpty()) {
                throw new RuntimeException("Role not found");
            }

            Role role = optionalRole.get();

            role.setRoleName(roleDTO.getRoleName());
            role.setStatus(roleDTO.getStatus());

            roleRepository.save(role);

        } catch (Exception e) {
            log.error("Error updating role", e);
            throw e;
        }
    }

    @Override
    public void changeRoleStatus(long roleId) {
        log.info("Change role status");

        try {
            Optional<Role> optionalRole =
                    roleRepository.findById(roleId);

            if (optionalRole.isEmpty()) {
                throw new RuntimeException("Role not found");
            }

            Role role = optionalRole.get();

            role.setStatus(UserStatus.INACTIVE);

            roleRepository.save(role);

        } catch (Exception e) {
            log.error("Error changing role status", e);
            throw e;
        }
    }

    @Override
    public List<RoleDTO> filterRoles(String roleName) {
        log.info("Filter roles");

        try {
            List<RoleDTO> roleDTOList = new ArrayList<>();

            List<Role> roles =
                    roleRepository.findByRoleNameContaining(roleName);

            for (Role role : roles) {
                RoleDTO roleDTO = new RoleDTO();

                roleDTO.setId(role.getId());
                roleDTO.setRoleName(role.getRoleName());
                roleDTO.setStatus(role.getStatus());

                roleDTOList.add(roleDTO);
            }

            return roleDTOList;

        } catch (Exception e) {
            log.error("Error filtering roles", e);
            throw e;
        }
    }
}