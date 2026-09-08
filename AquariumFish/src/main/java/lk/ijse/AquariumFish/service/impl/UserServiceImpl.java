package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.UserDTO;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.entity.User;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.repository.UserRepository;
import lk.ijse.AquariumFish.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
            user.setUsername(userDTO.getUsername());
            user.setPassword(userDTO.getPassword());
            user.setEmail(userDTO.getEmail());
            user.setStatus(userDTO.getStatus());
            user.setRole(role);
            userRepository.save(user);
        }catch(Exception e){
            log.error("Error saving user",e);
            throw e;
        }

    }

    @Override
    public List<UserDTO> getAllUsers() {
        try {
            List<UserDTO> userDTOList = new ArrayList<>();
            List<User> users = userRepository.findAll();
            for (User user : users) {
                UserDTO userDTO = new UserDTO();
                userDTO.setUsername(user.getUsername());
                userDTO.setPassword(user.getPassword());
                userDTO.setEmail(user.getEmail());
                userDTO.setStatus(user.getStatus());
                userDTOList.add(userDTO);

            }
        }
        return List.of();
    }

    @Override
    public void updateUser(UserDTO userDTO) {

    }

    @Override
    public void changeUserStatus(long userId) {
        log.info("Change user status");
        try {
            Optional<User> user = userRepository.findById(userId);
            if(user.isEmpty()){
                throw new RuntimeException( "User not found " );
            }
            User user1 = user.get();
            user1.setStatus(Status.INACTIVE);
            userRepository.save(user1);
        } catch (Exception e) {
            log.error("Error saving user");
            throw e;
        }

    }

    @Override
    public List<UserDTO> filterUsers(String username) {
        return List.of();
    }

    @Override
    public void changeUserRole(long userID, long roleID) {

    }
}
