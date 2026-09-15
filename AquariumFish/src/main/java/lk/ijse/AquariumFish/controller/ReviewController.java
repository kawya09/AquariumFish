package lk.ijse.AquariumFish.controller;

import lk.ijse.AquariumFish.constant.CommonResponse;
import lk.ijse.AquariumFish.dto.ReviewDTO;
import lk.ijse.AquariumFish.service.ReviewService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static lk.ijse.AquariumFish.constant.ResponseCode.OPERATION_SUCCESS;
import static lk.ijse.AquariumFish.constant.ResponseMassage.SUCCESS_MESSAGE;

@RequestMapping("v1/Review")
@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse saveReview(@RequestBody ReviewDTO reviewDTO) {
        reviewService.saveReview(reviewDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse getAllReview() {
        List<ReviewDTO> reviewDTOList = reviewService.getAllReviews();
        return new CommonResponse(OPERATION_SUCCESS, reviewDTOList, SUCCESS_MESSAGE);
    }

    @PutMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse updateReview(@RequestBody ReviewDTO reviewDTO) {
        reviewService.updateReview(reviewDTO);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @DeleteMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse deleteReview(@PathVariable Long id) {
        reviewService.changeReviewStatus(id);
        return new CommonResponse(OPERATION_SUCCESS, SUCCESS_MESSAGE);
    }

    @GetMapping(value = "/filter", produces = MediaType.APPLICATION_JSON_VALUE)
    public CommonResponse FilterReview(@RequestParam String comment) {
        List<ReviewDTO> reviewDTOList = reviewService.filterReviews(comment);
        return new CommonResponse(OPERATION_SUCCESS, reviewDTOList, SUCCESS_MESSAGE);
    }
}