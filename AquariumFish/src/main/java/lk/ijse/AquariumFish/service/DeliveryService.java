package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.DeliveryDTO;

import java.util.List;

public interface DeliveryService {

    void saveDelivery(DeliveryDTO dto);

    List<DeliveryDTO> getAllDeliveries();

    DeliveryDTO getDeliveryById(Long id);

    void updateDelivery(DeliveryDTO dto);

    void changeDeliveryStatus(Long id);

    List<DeliveryDTO> filterDeliveries(String trackingNo);
}