package lk.ijse.AquariumFish.dto;

import lk.ijse.AquariumFish.enumaration.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.management.relation.RoleStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleDTO {
    private Long id;
    private String roleName;
    private UserStatus status;


}
