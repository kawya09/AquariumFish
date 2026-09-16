package lk.ijse.AquariumFish.security;

import lk.ijse.AquariumFish.dto.UserDTO;
import lk.ijse.AquariumFish.entity.User;
import lk.ijse.AquariumFish.repository.UserRepository;
import lk.ijse.AquariumFish.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserService {

    private final UserRepository userRepository;


    @Override
    public User loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<com.example.aad_project.entity.User> optionalUser = userRepository.findByUsername(username);

        if (optionalUser.isEmpty())
            throw new UsernameNotFoundException("No user found with username: " + username);

        com.example.aad_project.entity.User user = optionalUser.get();

        return User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getUserRoles().getRoleName())
                .build();
    }
}
}
