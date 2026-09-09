package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.SellerDTO;
import lk.ijse.AquariumFish.dto.UserDTO;

import java.util.List;

public interface SellerService {
    void saveSeller(SellerDTO sellerDTO);

    List<SellerDTO> getAllSellers();

    void updateSeller(SellerDTO sellerDTO);

    void changeSellerStatus(long sellerDTO);

    List<SellerDTO> filterSellers(String username);

    void changeSellerRole(long sellerID, long roleID);
}
