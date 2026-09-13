package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.AdminDTO;
import lk.ijse.AquariumFish.entity.Admin;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.AdminRepository;
import lk.ijse.AquariumFish.service.AdminService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;

    public AdminServiceImpl(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public void saveAdmin(AdminDTO adminDTO) {

        Admin admin = new Admin();

        admin.setAdminName(adminDTO.getAdminName());
        admin.setStatus(adminDTO.getStatus());

        adminRepository.save(admin);
    }

    @Override
    public List<AdminDTO> getAllAdmins() {

        List<AdminDTO> list = new ArrayList<>();

        for (Admin admin : adminRepository.findAll()) {

            AdminDTO dto = new AdminDTO();

            dto.setId(admin.getId());
            dto.setAdminName(admin.getAdminName());
            dto.setStatus(admin.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public AdminDTO getAdminById(Long id) {

        Admin admin = adminRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        AdminDTO dto = new AdminDTO();

        dto.setId(admin.getId());
        dto.setAdminName(admin.getAdminName());
        dto.setStatus(admin.getStatus());

        return dto;
    }

    @Override
    public void updateAdmin(AdminDTO adminDTO) {

        Admin admin = adminRepository.findById(adminDTO.getId())
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        admin.setAdminName(adminDTO.getAdminName());
        admin.setStatus(adminDTO.getStatus());

        adminRepository.save(admin);
    }

    @Override
    public void changeAdminStatus(Long id) {

        Admin admin = adminRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Admin not found"));

        admin.setStatus(UserStatus.INACTIVE);

        adminRepository.save(admin);
    }

    @Override
    public List<AdminDTO> filterAdmins(String adminName) {

        List<AdminDTO> list = new ArrayList<>();

        for (Admin admin :
                adminRepository.findByAdminNameContaining(adminName)) {

            AdminDTO dto = new AdminDTO();

            dto.setId(admin.getId());
            dto.setAdminName(admin.getAdminName());
            dto.setStatus(admin.getStatus());

            list.add(dto);
        }

        return list;
    }
}