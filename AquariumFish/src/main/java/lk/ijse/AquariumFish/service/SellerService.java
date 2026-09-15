package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.SellerDTO;

import java.util.List;

public interface SellerService {

    void saveSeller(SellerDTO sellerDTO);

    List<SellerDTO> getAllSellers();

    void updateSeller(SellerDTO sellerDTO);

    void changeSellerStatus(long sellerId);

    List<SellerDTO> filterSellers(String shopName);

    void changeSellerRole(long sellerId, long roleId);
}