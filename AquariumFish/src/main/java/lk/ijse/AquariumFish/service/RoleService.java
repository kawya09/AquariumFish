package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.RoleDTO;

import java.util.List;

public interface RoleService {

    void saveRole(RoleDTO roleDTO);

    List<RoleDTO> getAllRoles();

    void updateRole(RoleDTO roleDTO);

    void changeRoleStatus(long roleId);

    List<RoleDTO> filterRoles(String roleName);
}