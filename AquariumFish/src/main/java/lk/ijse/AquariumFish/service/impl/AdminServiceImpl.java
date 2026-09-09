package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.AdminDTO;
import lk.ijse.AquariumFish.dto.UserDTO;
import lk.ijse.AquariumFish.repository.AdminRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.repository.UserRepository;
import lk.ijse.AquariumFish.service.AdminService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class AdminServiceImpl implements AdminService {
    private final AdminRepository adminRepository;
    private final RoleRepository roleRepository;
    public AdminServiceImpl(AdminRepository adminRepository, RoleRepository roleRepository) {
        this.adminRepository = adminRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void saveAdmin(AdminDTO adminDTO) {

    }

    @Override
    public List<AdminDTO> getAllAdmins() {
        return List.of();
    }

    @Override
    public void updateAdmin(AdminDTO adminDTO) {

    }

    @Override
    public void changeAdminStatus(long adminDTO) {

    }

    @Override
    public List<AdminDTO> filterAdmins(String username) {
        return List.of();
    }

    @Override
    public void changeAdminRole(long adminID, long roleID) {

    }
}
