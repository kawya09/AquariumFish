package lk.ijse.AquariumFish.service.impl;

import lk.ijse.AquariumFish.dto.ReviewDTO;
import lk.ijse.AquariumFish.entity.Review;
import lk.ijse.AquariumFish.enumaration.UserStatus;
import lk.ijse.AquariumFish.repository.ReviewRepository;
import lk.ijse.AquariumFish.service.ReviewService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository repository;

    public ReviewServiceImpl(ReviewRepository repository) {
        this.repository = repository;
    }

    @Override
    public void saveReview(ReviewDTO dto) {

        Review review = new Review();

        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setReviewDate(dto.getReviewDate());
        review.setStatus(dto.getStatus());

        repository.save(review);
    }

    @Override
    public List<ReviewDTO> getAllReviews() {

        List<ReviewDTO> list = new ArrayList<>();

        for (Review review : repository.findAll()) {

            ReviewDTO dto = new ReviewDTO();

            dto.setId(review.getId());
            dto.setRating(review.getRating());
            dto.setComment(review.getComment());
            dto.setReviewDate(review.getReviewDate());
            dto.setStatus(review.getStatus());

            list.add(dto);
        }

        return list;
    }

    @Override
    public ReviewDTO getReviewById(Long id) {

        Review review = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Review not found"));

        ReviewDTO dto = new ReviewDTO();

        dto.setId(review.getId());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setReviewDate(review.getReviewDate());
        dto.setStatus(review.getStatus());

        return dto;
    }

    @Override
    public void updateReview(ReviewDTO dto) {

        Review review = repository.findById(dto.getId())
                .orElseThrow(() ->
                        new RuntimeException("Review not found"));

        review.setRating(dto.getRating());
        review.setComment(dto.getComment());
        review.setReviewDate(dto.getReviewDate());
        review.setStatus(dto.getStatus());

        repository.save(review);
    }

    @Override
    public void changeReviewStatus(Long id) {

        Review review = repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Review not found"));

        review.setStatus(UserStatus.INACTIVE);

        repository.save(review);
    }

    @Override
    public List<ReviewDTO> filterReviews(Integer rating) {

        List<ReviewDTO> list = new ArrayList<>();

        for (Review review :
                repository.findByRating(rating)) {

            ReviewDTO dto = new ReviewDTO();

            dto.setId(review.getId());
            dto.setRating(review.getRating());
            dto.setComment(review.getComment());
            dto.setReviewDate(review.getReviewDate());
            dto.setStatus(review.getStatus());

            list.add(dto);
        }

        return list;
    }
}