package com.studybuddy.controller;

import com.studybuddy.model.StudyPlan;
import com.studybuddy.model.User;
import com.studybuddy.service.StudyPlanService;
import com.studybuddy.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/studyplans")
@CrossOrigin(origins = "http://localhost:5173")
public class StudyPlanController {

    private final StudyPlanService studyPlanService;
    private final UserService userService;

    public StudyPlanController(StudyPlanService studyPlanService, UserService userService) {
        this.studyPlanService = studyPlanService;
        this.userService = userService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    @GetMapping
    public ResponseEntity<List<StudyPlan>> getPlans() {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(studyPlanService.getAllPlans(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudyPlan> getPlanById(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        return studyPlanService.getPlanById(id, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<StudyPlan> createPlan(@RequestBody StudyPlan plan) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(studyPlanService.createPlan(plan, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudyPlan> updatePlan(@PathVariable Long id, @RequestBody StudyPlan planDetails) {
        User user = getAuthenticatedUser();
        try {
            return ResponseEntity.ok(studyPlanService.updatePlan(id, planDetails, user));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        try {
            studyPlanService.deletePlan(id, user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
