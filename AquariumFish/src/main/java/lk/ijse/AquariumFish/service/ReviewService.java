package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.ReviewDTO;
import lk.ijse.AquariumFish.dto.RoleDTO;

import java.util.List;

public interface ReviewService {
    void saveReview(ReviewDTO reviewDTO);

    List<ReviewDTO> getAllReviews();

    void updateReviews(ReviewDTO reviewDTO);

    void changeReviewStatus(long reviewDTO);

    List<ReviewDTO> filterReviews(String username);
}
