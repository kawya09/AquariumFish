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
import java.util.Optional;

@Service
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;

    public AdminServiceImpl(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    @Override
    public void saveAdmin(AdminDTO adminDTO) {
        log.info("Save admin");

        try {
            Admin admin = new Admin();

            admin.setAdminName(adminDTO.getAdminName());
            admin.setStatus(adminDTO.getStatus());

            adminRepository.save(admin);

        } catch (Exception e) {
            log.error("Error saving admin", e);
            throw e;
        }
    }

    @Override
    public List<AdminDTO> getAllAdmins() {
        log.info("Get all admins");

        try {
            List<AdminDTO> adminDTOList = new ArrayList<>();

            List<Admin> admins = adminRepository.findAll();

            for (Admin admin : admins) {
                AdminDTO adminDTO = new AdminDTO();

                adminDTO.setId(admin.getId());
                adminDTO.setAdminName(admin.getAdminName());
                adminDTO.setStatus(admin.getStatus());

                adminDTOList.add(adminDTO);
            }

            return adminDTOList;

        } catch (Exception e) {
            log.error("Error getting all admins", e);
            throw e;
        }
    }

    @Override
    public void updateAdmin(AdminDTO adminDTO) {
        log.info("Update admin");

        try {
            Optional<Admin> optionalAdmin =
                    adminRepository.findById(adminDTO.getId());

            if (optionalAdmin.isEmpty()) {
                throw new RuntimeException("Admin not found");
            }

            Admin admin = optionalAdmin.get();

            admin.setAdminName(adminDTO.getAdminName());
            admin.setStatus(adminDTO.getStatus());

            adminRepository.save(admin);

        } catch (Exception e) {
            log.error("Error updating admin", e);
            throw e;
        }
    }

    @Override
    public void changeAdminStatus(long adminId) {
        log.info("Change admin status");

        try {
            Optional<Admin> optionalAdmin =
                    adminRepository.findById(adminId);

            if (optionalAdmin.isEmpty()) {
                throw new RuntimeException("Admin not found");
            }

            Admin admin = optionalAdmin.get();

            admin.setStatus(UserStatus.INACTIVE);

            adminRepository.save(admin);

        } catch (Exception e) {
            log.error("Error changing admin status", e);
            throw e;
        }
    }

    @Override
    public List<AdminDTO> filterAdmins(String adminName) {
        log.info("Filter admins");

        try {
            List<AdminDTO> adminDTOList = new ArrayList<>();

            List<Admin> admins =
                    adminRepository.findByAdminNameContaining(adminName);

            for (Admin admin : admins) {
                AdminDTO adminDTO = new AdminDTO();

                adminDTO.setId(admin.getId());
                adminDTO.setAdminName(admin.getAdminName());
                adminDTO.setStatus(admin.getStatus());

                adminDTOList.add(adminDTO);
            }

            return adminDTOList;

        } catch (Exception e) {
            log.error("Error filtering admins", e);
            throw e;
        }
    }
}