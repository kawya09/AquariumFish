package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.UserDTO;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.entity.User;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.repository.UserRepository;
import lk.ijse.AquariumFish.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    @Override
    public void saveUser(UserDTO userDTO) {
        log.info("Save user");

        try{
            Role role = roleRepository.findById(userDTO.getId())
                    .orElseThrow(() -> new RuntimeException( "Role not found " ));

            User user = new User();
        }

    }

    @Override
    public List<UserDTO> getAllUsers() {
        return List.of();
    }

    @Override
    public void updateUser(UserDTO userDTO) {

    }

    @Override
    public void changeUserStatus(long userDTO) {

    }

    @Override
    public List<UserDTO> filterUsers(String username) {
        return List.of();
    }

    @Override
    public void changeUserRole(long userID, long roleID) {

    }
}
