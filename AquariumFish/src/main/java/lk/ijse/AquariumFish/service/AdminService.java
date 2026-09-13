package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.AdminDTO;

import java.util.List;

public interface AdminService {

    void saveAdmin(AdminDTO adminDTO);

    List<AdminDTO> getAllAdmins();

    AdminDTO getAdminById(Long id);

    void updateAdmin(AdminDTO adminDTO);

    void changeAdminStatus(Long id);

    List<AdminDTO> filterAdmins(String adminName);
}