package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.RoleDTO;
import lk.ijse.AquariumFish.dto.SellerDTO;

import java.util.List;

public interface RoleService {
    void saveRole(RoleDTO roleDTO);

    List<RoleDTO> getAllRoles();

    void updateRoles(RoleDTO roleDTO);

    void changeRoleStatus(long roleDTO);

    List<RoleDTO> filterRoles(String username);


}
