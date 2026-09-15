package lk.ijse.AquariumFish.service;

import lk.ijse.AquariumFish.dto.ReviewDTO;

import java.util.List;

public interface ReviewService {

    void saveReview(ReviewDTO reviewDTO);

    List<ReviewDTO> getAllReviews();

    void updateReview(ReviewDTO reviewDTO);

    void changeReviewStatus(long reviewId);

    List<ReviewDTO> filterReviews(String comment);
}