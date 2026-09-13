package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.SellerDTO;

import java.util.List;

public interface SellerService {

    void saveSeller(SellerDTO sellerDTO);

    List<SellerDTO> getAllSellers();

    SellerDTO getSellerById(Long id);

    void updateSeller(SellerDTO sellerDTO);

    void changeSellerStatus(Long id);

    List<SellerDTO> filterSellers(String shopName);

    void changeSellerRole(Long sellerId, Long roleId);
}