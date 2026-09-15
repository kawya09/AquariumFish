package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.DeliveryDTO;

import java.util.List;

public interface DeliveryService {

    void saveDelivery(DeliveryDTO deliveryDTO);

    List<DeliveryDTO> getAllDeliveries();

    void updateDelivery(DeliveryDTO deliveryDTO);

    void changeDeliveryStatus(long deliveryId);

    List<DeliveryDTO> filterDeliveries(String trackingNo);
}