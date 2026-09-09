package lk.ijse.AquariumFish.dto;

import lk.ijse.AquariumFish.enumaration.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
    private UserStatus status;
}
