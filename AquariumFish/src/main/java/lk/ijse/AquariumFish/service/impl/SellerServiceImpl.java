package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.SellerDTO;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.entity.Seller;
import lk.ijse.AquariumFish.entity.User;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.repository.SellerRepository;
import lk.ijse.AquariumFish.service.SellerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class SellerServiceImpl implements SellerService {

    private final SellerRepository sellerRepository;
    private final RoleRepository roleRepository;

    public SellerServiceImpl(SellerRepository sellerRepository,
                             RoleRepository roleRepository) {
        this.sellerRepository = sellerRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void saveSeller(SellerDTO dto) {

        log.info("Save selller");

        try {
            Role role = roleRepository.findById(sellerDTO.getRoleId())
                    .orElseThrow(() ->
                            new RuntimeException("Role not found"));

            User user = new User();
            role.setId(getSellerById().setId(););


            sellerRepository.save(user);

        } catch (Exception e) {
            log.error("Error saving user", e);
            throw e;
        }
    }

    @Override
    public List<SellerDTO> getAllSellers() {

        List<SellerDTO> list = new ArrayList<>();

        for (Seller seller : sellerRepository.findAll()) {

            SellerDTO dto = new SellerDTO();

            dto.setId(seller.getId());
            dto.setShopName(seller.getShopName());
            dto.setPhone(seller.getPhone());
            dto.setAddress(seller.getAddress());
            dto.setStatus(seller.getStatus());

            if (seller.getRole() != null) {
                dto.setRoleId(seller.getRole().getId());
            }

            list.add(dto);
        }

        return list;
    }

    @Override
    public SellerDTO getSellerById(Long id) {

        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Seller not found"));

        SellerDTO dto = new SellerDTO();

        dto.setId(seller.getId());
        dto.setShopName(seller.getShopName());
        dto.setPhone(seller.getPhone());
        dto.setAddress(seller.getAddress());
        dto.setStatus(seller.getStatus());

        if (seller.getRole() != null) {
            dto.setRoleId(seller.getRole().getId());
        }

        return dto;
    }

    @Override
    public void updateSeller(SellerDTO dto) {

        Seller seller = sellerRepository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Seller not found"));

        seller.setShopName(dto.getShopName());
        seller.setPhone(dto.getPhone());
        seller.setAddress(dto.getAddress());
        seller.setStatus(dto.getStatus());

        if (dto.getRoleId() != null) {

            Role role = roleRepository.findById(dto.getRoleId())
                    .orElseThrow(() ->
                            new RuntimeException("Role not found"));

            seller.setRole(role);
        }

        sellerRepository.save(seller);
    }

    @Override
    public void changeSellerStatus(Long id) {

        Seller seller = sellerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Seller not found"));

        seller.setStatus(UserStatus.INACTIVE);

        sellerRepository.save(seller);
    }

    @Override
    public List<SellerDTO> filterSellers(String shopName) {

        List<SellerDTO> list = new ArrayList<>();

        for (Seller seller :
                sellerRepository.findByShopNameContaining(shopName)) {

            SellerDTO dto = new SellerDTO();

            dto.setId(seller.getId());
            dto.setShopName(seller.getShopName());
            dto.setPhone(seller.getPhone());
            dto.setAddress(seller.getAddress());
            dto.setStatus(seller.getStatus());

            if (seller.getRole() != null) {
                dto.setRoleId(seller.getRole().getId());
            }

            list.add(dto);
        }

        return list;
    }

    @Override
    public void changeSellerRole(Long sellerId, Long roleId) {

        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() ->
                        new RuntimeException("Seller not found"));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() ->
                        new RuntimeException("Role not found"));

        seller.setRole(role);

        sellerRepository.save(seller);
    }
}