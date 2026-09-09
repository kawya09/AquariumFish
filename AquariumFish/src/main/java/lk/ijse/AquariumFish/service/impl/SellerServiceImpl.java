package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.SellerDTO;
import lk.ijse.AquariumFish.dto.UserDTO;
import lk.ijse.AquariumFish.entity.Role;
import lk.ijse.AquariumFish.entity.Seller;
import lk.ijse.AquariumFish.entity.User;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.RoleRepository;
import lk.ijse.AquariumFish.repository.SellerRepository;
import lk.ijse.AquariumFish.service.SellerService;
import lk.ijse.AquariumFish.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j

public class SellerServiceImpl implements SellerService {

    private SellerRepository sellerRepository;
    private RoleRepository roleRepository;

    public SellerServiceImpl(SellerRepository sellerRepository, RoleRepository roleRepository) {
        this.sellerRepository = sellerRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public void saveSeller(SellerDTO sellerDTO) {
        log.info("Saving seller");

        try {
            Role role = roleRepository.findById(sellerDTO.getId())
                    .orElseThrow(() -> new RuntimeException( "Role not found " ));
            Seller seller = new Seller();
            seller.setShopName(sellerDTO.getShopName());
            seller.setPhone(sellerDTO.getPhone());
            seller.setAddress(sellerDTO.getAddress());
            seller.setRole(role);
            sellerRepository.save(seller);
        }catch (Exception e){
            log.error("Error saving seller",e);
            throw e;
        }

    }

    @Override
    public List<SellerDTO> getAllSellers() {
        try {
            List<SellerDTO> sellerDTOList = new ArrayList<>();
            List<Seller> sellers = sellerRepository.findAll();
            for (Seller seller : sellers) {
                SellerDTO sellerDTO = new SellerDTO();

                sellerDTO.setShopName(seller.getShopName());
                sellerDTO.setPhone(seller.getPhone());
                sellerDTO.setAddress(seller.getAddress());
                sellerDTOList.add(sellerDTO);

            }
            return sellerDTOList;
        } catch (Exception e) {
            log.error("Error saving seller");
            throw e;
        }

    }

    @Override
    public void updateSeller(SellerDTO sellerDTO) {
        log.info("Update seller");
        try{
            Optional<Seller> seller = sellerRepository.findById(sellerDTO.getId());
            if(seller.isEmpty()){
                throw new RuntimeException( "Seller not found " );

            }
            Seller seller1 = seller.get();
           seller1.setShopName(sellerDTO.getShopName());
           seller1.setPhone(sellerDTO.getPhone());
           seller1.setAddress(sellerDTO.getAddress());
            Role role = roleRepository.findById(sellerDTO.getRoleId()).orElseThrow(() -> new RuntimeException( "Role not found " ));
            Seller seller2 = seller.get();
            seller1.setRole(role);
            sellerRepository.save(seller1);
        }catch(Exception e){
            log.error("Error savingseller");
            throw e;
        }
    }

    @Override
    public void changeSellerStatus(long sellerId) {
        log.info("Change seller status");
        try {
            Optional<Seller> seller = sellerRepository.findById(sellerId);
            if(seller.isEmpty()){
                throw new RuntimeException( "Seller not found " );
            }
            Seller seller1 = seller.get();
            seller1.setStatus(UserStatus.INACTIVE);
            sellerRepository.save(seller1);
        } catch (Exception e) {
            log.error("Error saving seller");
            throw e;
        }
    }

    @Override
    public List<SellerDTO> filterSellers(String username) {
        try {
            List<SellerDTO> sellerDTOList = new ArrayList<>();
            List<Seller> sellers = sellerRepository.findByUsernameContaining((username));
            for (Seller seller :sellers) {

            }
            return sellerDTOList;
        } catch (Exception e) {
            log.error("Error saving seller");
            throw e;
        }
    }

    @Override
    public void changeSellerRole(long sellerID, long roleID) {
        log.info("Change seller role");
        try {
            Optional<Seller> seller = sellerRepository.findById(sellerID);
            if(seller.isEmpty()){
                throw new RuntimeException( "seller not found " );
            }
            Role role = roleRepository.findById(roleID).orElseThrow(() -> new RuntimeException( "Role not found " ));
            Seller seller1 = seller.get();
//            seller1.setRole(role);
            sellerRepository.save(seller1);
        }catch(Exception e){
            log.error("Error saving user");
            throw e;
        }

    }
}
