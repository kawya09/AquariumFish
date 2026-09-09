package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.RoleDTO;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.service.RoleService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class RoleServiceImpl implements RoleService {
    private RoleRepository roleRepository;
    public RoleServiceImpl(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }
    @Override
    public void saveRole(RoleDTO roleDTO) {


    }

    @Override
    public List<RoleDTO> getAllRoles() {
        return List.of();
    }

    @Override
    public void updateRoles(RoleDTO roleDTO) {

    }

    @Override
    public void changeRoleStatus(long roleDTO) {

    }

    @Override
    public List<RoleDTO> filterRoles(String username) {
        return List.of();
    }
}
