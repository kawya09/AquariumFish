package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.AdminDTO;
import lk.ijse.AquariumFish.dto.UserDTO;
import lk.ijse.AquariumFish.entity.Admin;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.entity.User;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.AdminRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.repository.UserRepository;
import lk.ijse.AquariumFish.service.AdminService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
        log.info("Save Admin");

        try{
            Role role = roleRepository.findById(adminDTO.getId())
                    .orElseThrow(() -> new RuntimeException( "Admin not found " ));

            Admin admin = new Admin();
            admin.setAdminName(adminDTO.getAdminName());
            admin.setStatus(adminDTO.getStatus());
            adminRepository.save(admin);
        }catch(Exception e){
            log.error("Error saving admin",e);
            throw e;
        }

    }

    @Override
    public List<AdminDTO> getAllAdmins() {
        try {
            List<AdminDTO> adminDTOList = new ArrayList<>();
            List<Admin> admins =adminRepository.findAll();
            for (Admin admin : admins) {
                AdminDTO adminDTO = new AdminDTO();
                adminDTO.setId(admin.getId());
                adminDTO.setAdminName(admin.getAdminName());
                adminDTO.setStatus(admin.getStatus());
               adminDTOList.add(adminDTO);
            }
            return adminDTOList;
        } catch (Exception e) {
            log.error("Error saving admin");
            throw e;
        }
    }

    @Override
    public void updateAdmin(AdminDTO adminDTO) {
        log.info("Update admin");
        try{
            Optional<Admin> admin = adminRepository.findById(adminDTO.getId());
            if(admin.isEmpty()){
                throw new RuntimeException( "Admin not found " );

            }
            Admin admin1 = admin.get();
            admin1.setAdminName(adminDTO.getAdminName());
            admin1.setStatus(adminDTO.getStatus());
            Role role = roleRepository.findById(adminDTO.getId()).orElseThrow(() -> new RuntimeException( "Role not found " ));
            Admin admin2 = admin.get();
            adminRepository.save(admin1);
        }catch(Exception e){
            log.error("Error saving user");
            throw e;
        }

    }

    @Override
    public void changeAdminStatus(long adminId) {
        log.info("Change admin status");
        try {
            Optional<Admin> admin = adminRepository.findById(adminId);
            if(admin.isEmpty()){
                throw new RuntimeException( "Admin not found " );
            }
            Admin admin1 = admin.get();
            admin1.setStatus(UserStatus.INACTIVE);
            adminRepository.save(admin1);
        } catch (Exception e) {
            log.error("Error saving user");
            throw e;
        }

    }

    @Override
    public List<AdminDTO> filterAdmins(String username) {
        try {
            List<AdminDTO> adminDTOList = new ArrayList<>();
            List<Admin> admins = adminRepository.findByUsernameContaining((username));
            for (Admin admin :admins) {
                AdminDTO adminDTO = new AdminDTO();
                adminDTO.setId(admin.getId());
                adminDTO.setAdminName(admin.getAdminName());
                adminDTO.setStatus(admin.getStatus());

                adminDTOList.add(adminDTO);
            }
            return adminDTOList;
        } catch (Exception e) {
            log.error("Error saving admin");
            throw e;
        }
    }

    @Override
    public void changeAdminRole(long adminID, long roleID) {
        log.info("Change admin role");
        try {
            Optional<Admin> admin = adminRepository.findById(adminID);
            if(admin.isEmpty()){
                throw new RuntimeException( "Admin not found " );
            }
            Role role = roleRepository.findById(roleID).orElseThrow(() -> new RuntimeException( "Admin not found " ));
            Admin admin1 = admin.get();
            adminRepository.save(admin1);
        }catch(Exception e){
            log.error("Error saving admin");
            throw e;
        }
    }
}
