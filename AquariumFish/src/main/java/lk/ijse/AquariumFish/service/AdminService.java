package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.AdminDTO;

import java.util.List;

public interface AdminService {

    void saveAdmin(AdminDTO adminDTO);

    List<AdminDTO> getAllAdmins();

    void updateAdmin(AdminDTO adminDTO);

    void changeAdminStatus(long adminId);

    List<AdminDTO> filterAdmins(String adminName);
}