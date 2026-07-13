package com.studybuddy.service;

import com.studybuddy.model.StudyPlan;
import com.studybuddy.model.User;
import com.studybuddy.repository.StudyPlanRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudyPlanService {

    private final StudyPlanRepository studyPlanRepository;
    private final StudyProgressService progressService;

    public StudyPlanService(StudyPlanRepository studyPlanRepository, StudyProgressService progressService) {
        this.studyPlanRepository = studyPlanRepository;
        this.progressService = progressService;
    }

    public List<StudyPlan> getAllPlans(User user) {
        return studyPlanRepository.findByUser(user);
    }

    public Optional<StudyPlan> getPlanById(Long id, User user) {
        return studyPlanRepository.findById(id)
                .filter(plan -> plan.getUser().getId().equals(user.getId()));
    }

    public StudyPlan createPlan(StudyPlan plan, User user) {
        plan.setUser(user);
        StudyPlan savedPlan = studyPlanRepository.save(plan);
        
        // Log study hours in progress tracker (converting minutes to hours)
        if (plan.getDuration() != null && plan.getDuration() > 0) {
            double hours = plan.getDuration() / 60.0;
            progressService.logStudyHours(user, hours);
        }
        
        return savedPlan;
    }

    public StudyPlan updatePlan(Long id, StudyPlan planDetails, User user) {
        StudyPlan plan = getPlanById(id, user)
                .orElseThrow(() -> new RuntimeException("Study plan not found."));

        plan.setSubject(planDetails.getSubject());
        plan.setStudyDate(planDetails.getStudyDate());
        
        // If duration is updated, log difference in hours
        int durationDiff = planDetails.getDuration() - plan.getDuration();
        plan.setDuration(planDetails.getDuration());
        
        StudyPlan savedPlan = studyPlanRepository.save(plan);
        
        if (durationDiff != 0) {
            progressService.logStudyHours(user, durationDiff / 60.0);
        }

        return savedPlan;
    }

    public void deletePlan(Long id, User user) {
        StudyPlan plan = getPlanById(id, user)
                .orElseThrow(() -> new RuntimeException("Study plan not found."));
        
        // Decrement study hours
        if (plan.getDuration() != null && plan.getDuration() > 0) {
            progressService.logStudyHours(user, -plan.getDuration() / 60.0);
        }
        
        studyPlanRepository.delete(plan);
    }
}
