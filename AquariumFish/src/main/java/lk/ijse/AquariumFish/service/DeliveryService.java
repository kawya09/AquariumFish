package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.CustomerDTO;
import lk.ijse.AquariumFish.dto.DeliveryDTO;

import java.util.List;

public interface DeliveryService {
    void saveDelivery(DeliveryDTO deliveryDTO);

    List<DeliveryDTO> getAllDeliveries();

    void updateDelivery(DeliveryDTO deliveryDTO);

    void changeDeliveryStatus(long deliveryDTO);

    List<DeliveryDTO> filterDelivers(String username);

    void changeDeliveryRole(long deliveryID, long roleID);
}
