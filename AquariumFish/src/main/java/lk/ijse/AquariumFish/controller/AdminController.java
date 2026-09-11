package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.AdminDTO;
import lk.ijse.AquariumFish.dto.UserDTO;
import lk.ijse.AquariumFish.repository.Cart_ItemRepository;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.service.AdminService;
import lk.ijse.AquariumFish.service.Cart_ItemService;
import lk.ijse.AquariumFish.service.SellerService;
import lk.ijse.AquariumFish.service.UserService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/admin")
@RestController
public class AdminController {
private final AdminService adminService;
private final UserService userService;
    public   AdminController(AdminService adminService, UserService userService){

        this.userService=userService;
        this.adminService=adminService;
    }
    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveAdmin(@RequestBody AdminDTO adminDTO){
        adminService.saveAdmin(adminDTO);
        return new CommonResponse(OPERATION_SUCCESS,SUCCESS_MESSAGE);
    }
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllAdmin(){
        List<AdminDTO> adminDTOList = adminService.getAllAdmins();
        return new CommonResponse(OPERATION_SUCCESS,adminDTOList,SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateAdmin(@RequestBody AdminDTO adminDTO){
        adminService.updateAdmin(adminDTO);
        return new CommonResponse(OPERATION_SUCCESS,SUCCESS_MESSAGE);

    }

    @DeleteMapping(value = "/filter",produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteAdmin(@PathVariable Long id){
        adminService.changeAdminStatus(id);
        return new CommonResponse(OPERATION_SUCCESS,SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter",produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterAdmin(@RequestParam String Username){
        List<AdminDTO> adminDTOList = adminService.filterAdmins(Username) ;
        return new CommonResponse(OPERATION_SUCCESS,adminDTOList,SUCCESS_MESSAGE);
    }
}
