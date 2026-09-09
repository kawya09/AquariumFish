package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.AdminDTO;
import lk.ijse.AquariumFish.dto.UserDTO;

import java.util.List;

public interface AdminService {
    void saveAdmin(AdminDTO adminDTO);

    List<AdminDTO> getAllAdmins();

    void updateAdmin(AdminDTO adminDTO);

    void changeAdminStatus(long adminDTO);

    List<AdminDTO> filterAdmins(String username);

    void changeAdminRole(long adminID, long roleID);
}
