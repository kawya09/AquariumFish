package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.UserDTO;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.entity.User;
import lk.ijse.AquariumFish.enumaration.UserStatus;
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

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void saveUser(UserDTO userDTO) {
        log.info("Save user");

        try {
            Role role = roleRepository.findById(userDTO.getRoleId())
                    .orElseThrow(() ->
                            new RuntimeException("Role not found"));

            User user = new User();

            user.setUsername(userDTO.getUsername());
            user.setPassword(userDTO.getPassword());
            user.setEmail(userDTO.getEmail());
            user.setStatus(userDTO.getStatus());
            user.setRole(role);

            userRepository.save(user);

        } catch (Exception e) {
            log.error("Error saving user", e);
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

                userDTO.setId(user.getId());
                userDTO.setUsername(user.getUsername());
                userDTO.setPassword(user.getPassword());
                userDTO.setEmail(user.getEmail());
                userDTO.setStatus(user.getStatus());

                if (user.getRole() != null) {
                    userDTO.setRoleId(user.getRole().getId());
                }

                userDTOList.add(userDTO);
            }

            return userDTOList;

        } catch (Exception e) {
            log.error("Error getting all users", e);
            throw e;
        }
    }

    @Override
    public void updateUser(UserDTO userDTO) {

        log.info("Update user");

        try {

            Optional<User> optionalUser =
                    userRepository.findById(userDTO.getId());

            if (optionalUser.isEmpty()) {
                throw new RuntimeException("User not found");
            }

            User user = optionalUser.get();

            user.setUsername(userDTO.getUsername());
            user.setPassword(userDTO.getPassword());
            user.setEmail(userDTO.getEmail());
            user.setStatus(userDTO.getStatus());

            if (userDTO.getRoleId() != null) {

                Role role = roleRepository.findById(userDTO.getRoleId())
                        .orElseThrow(() ->
                                new RuntimeException("Role not found"));

                user.setRole(role);
            }

            userRepository.save(user);

        } catch (Exception e) {
            log.error("Error updating user", e);
            throw e;
        }
    }

    @Override
    public void changeUserStatus(long userId) {

        log.info("Change user status");

        try {

            Optional<User> optionalUser =
                    userRepository.findById(userId);

            if (optionalUser.isEmpty()) {
                throw new RuntimeException("User not found");
            }

            User user = optionalUser.get();

            user.setStatus(UserStatus.INACTIVE);

            userRepository.save(user);

        } catch (Exception e) {
            log.error("Error changing user status", e);
            throw e;
        }
    }

    @Override
    public List<UserDTO> filterUsers(String username) {

        try {

            List<UserDTO> userDTOList = new ArrayList<>();

            List<User> users =
                    userRepository.findByUsernameContaining(username);

            for (User user : users) {

                UserDTO userDTO = new UserDTO();

                userDTO.setId(user.getId());
                userDTO.setUsername(user.getUsername());
                userDTO.setPassword(user.getPassword());
                userDTO.setEmail(user.getEmail());
                userDTO.setStatus(user.getStatus());

                if (user.getRole() != null) {
                    userDTO.setRoleId(user.getRole().getId());
                }

                userDTOList.add(userDTO);
            }

            return userDTOList;

        } catch (Exception e) {
            log.error("Error filtering users", e);
            throw e;
        }
    }

    @Override
    public void changeUserRole(long userID, long roleID) {

        log.info("Change user role");

        try {

            User user = userRepository.findById(userID)
                    .orElseThrow(() ->
                            new RuntimeException("User not found"));

            Role role = roleRepository.findById(roleID)
                    .orElseThrow(() ->
                            new RuntimeException("Role not found"));

            user.setRole(role);

            userRepository.save(user);

        } catch (Exception e) {
            log.error("Error changing user role", e);
            throw e;
        }
    }
}