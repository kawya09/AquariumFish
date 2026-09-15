package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.ReviewDTO;

import java.util.List;

public interface ReviewService {

    void saveReview(ReviewDTO dto);

    List<ReviewDTO> getAllReviews();

    ReviewDTO getReviewById(Long id);

    void updateReview(ReviewDTO dto);

    void changeReviewStatus(Long id);

    List<ReviewDTO> filterReviews(Integer rating);
}