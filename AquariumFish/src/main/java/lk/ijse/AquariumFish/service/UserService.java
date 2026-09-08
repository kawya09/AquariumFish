package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.UserDTO;

import java.util.List;

public interface UserService {
    void saveUser(UserDTO userDTO);

    List<UserDTO> getAllUsers();

    void updateUser(UserDTO userDTO);

    void changeUserStatus(long userDTO);

    List<UserDTO> filterUsers(String username);

    void changeUserRole(long userID, long roleID);
}
