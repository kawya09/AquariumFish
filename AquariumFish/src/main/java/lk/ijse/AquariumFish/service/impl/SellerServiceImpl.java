package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.SellerDTO;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.entity.Seller;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.repository.SellerRepository;
import lk.ijse.AquariumFish.service.SellerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
    public void saveSeller(SellerDTO sellerDTO) {
        log.info("Save seller");

        try {
            Seller seller = new Seller();

            seller.setShopName(sellerDTO.getShopName());
            seller.setPhone(sellerDTO.getPhone());
            seller.setAddress(sellerDTO.getAddress());
            seller.setStatus(sellerDTO.getStatus());

            if (sellerDTO.getRoleId() != null) {
                Role role = roleRepository.findById(sellerDTO.getRoleId())
                        .orElseThrow(() ->
                                new RuntimeException("Role not found"));

                seller.setRole(role);
            }

            sellerRepository.save(seller);

        } catch (Exception e) {
            log.error("Error saving seller", e);
            throw e;
        }
    }

    @Override
    public List<SellerDTO> getAllSellers() {
        log.info("Get all sellers");

        try {
            List<SellerDTO> sellerDTOList = new ArrayList<>();

            List<Seller> sellers = sellerRepository.findAll();

            for (Seller seller : sellers) {
                SellerDTO sellerDTO = new SellerDTO();

                sellerDTO.setId(seller.getId());
                sellerDTO.setShopName(seller.getShopName());
                sellerDTO.setPhone(seller.getPhone());
                sellerDTO.setAddress(seller.getAddress());
                sellerDTO.setStatus(seller.getStatus());

                if (seller.getRole() != null) {
                    sellerDTO.setRoleId(seller.getRole().getId());
                }

                sellerDTOList.add(sellerDTO);
            }

            return sellerDTOList;

        } catch (Exception e) {
            log.error("Error getting all sellers", e);
            throw e;
        }
    }

    @Override
    public void updateSeller(SellerDTO sellerDTO) {
        log.info("Update seller");

        try {
            Optional<Seller> optionalSeller =
                    sellerRepository.findById(sellerDTO.getId());

            if (optionalSeller.isEmpty()) {
                throw new RuntimeException("Seller not found");
            }

            Seller seller = optionalSeller.get();

            seller.setShopName(sellerDTO.getShopName());
            seller.setPhone(sellerDTO.getPhone());
            seller.setAddress(sellerDTO.getAddress());
            seller.setStatus(sellerDTO.getStatus());

            if (sellerDTO.getRoleId() != null) {
                Role role = roleRepository.findById(sellerDTO.getRoleId())
                        .orElseThrow(() ->
                                new RuntimeException("Role not found"));

                seller.setRole(role);
            }

            sellerRepository.save(seller);

        } catch (Exception e) {
            log.error("Error updating seller", e);
            throw e;
        }
    }

    @Override
    public void changeSellerStatus(long sellerId) {
        log.info("Change seller status");

        try {
            Optional<Seller> optionalSeller =
                    sellerRepository.findById(sellerId);

            if (optionalSeller.isEmpty()) {
                throw new RuntimeException("Seller not found");
            }

            Seller seller = optionalSeller.get();

            seller.setStatus(UserStatus.INACTIVE);

            sellerRepository.save(seller);

        } catch (Exception e) {
            log.error("Error changing seller status", e);
            throw e;
        }
    }

    @Override
    public List<SellerDTO> filterSellers(String shopName) {
        log.info("Filter sellers");

        try {
            List<SellerDTO> sellerDTOList = new ArrayList<>();

            List<Seller> sellers =
                    sellerRepository.findByShopNameContaining(shopName);

            for (Seller seller : sellers) {
                SellerDTO sellerDTO = new SellerDTO();

                sellerDTO.setId(seller.getId());
                sellerDTO.setShopName(seller.getShopName());
                sellerDTO.setPhone(seller.getPhone());
                sellerDTO.setAddress(seller.getAddress());
                sellerDTO.setStatus(seller.getStatus());

                if (seller.getRole() != null) {
                    sellerDTO.setRoleId(seller.getRole().getId());
                }

                sellerDTOList.add(sellerDTO);
            }

            return sellerDTOList;

        } catch (Exception e) {
            log.error("Error filtering sellers", e);
            throw e;
        }
    }

    @Override
    public void changeSellerRole(long sellerId, long roleId) {
        log.info("Change seller role");

        try {
            Seller seller = sellerRepository.findById(sellerId)
                    .orElseThrow(() ->
                            new RuntimeException("Seller not found"));

            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() ->
                            new RuntimeException("Role not found"));

            seller.setRole(role);

            sellerRepository.save(seller);

        } catch (Exception e) {
            log.error("Error changing seller role", e);
            throw e;
        }
    }
}