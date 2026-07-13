package com.studybuddy.service;

import com.studybuddy.model.StudyProgress;
import com.studybuddy.model.User;
import com.studybuddy.repository.StudyProgressRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class StudyProgressService {

    private final StudyProgressRepository progressRepository;

    public StudyProgressService(StudyProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    public StudyProgress getOrCreateProgress(User user, LocalDate date) {
        Optional<StudyProgress> progressOpt = progressRepository.findByUserAndDate(user, date);
        if (progressOpt.isPresent()) {
            return progressOpt.get();
        } else {
            StudyProgress progress = new StudyProgress();
            progress.setUser(user);
            progress.setDate(date);
            return progressRepository.save(progress);
        }
    }

    public void incrementNotesCreated(User user) {
        StudyProgress progress = getOrCreateProgress(user, LocalDate.now());
        progress.setNotesCreated(progress.getNotesCreated() + 1);
        progressRepository.save(progress);
    }

    public void incrementTasksCompleted(User user) {
        StudyProgress progress = getOrCreateProgress(user, LocalDate.now());
        progress.setTasksCompleted(progress.getTasksCompleted() + 1);
        progressRepository.save(progress);
    }

    public void logStudyHours(User user, Double hours) {
        StudyProgress progress = getOrCreateProgress(user, LocalDate.now());
        progress.setStudyHours(progress.getStudyHours() + hours);
        progressRepository.save(progress);
    }

    public List<StudyProgress> getWeeklyProgress(User user) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);
        return progressRepository.findByUserAndDateBetweenOrderByDateAsc(user, start, end);
    }

    public List<StudyProgress> getMonthlyProgress(User user) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29);
        return progressRepository.findByUserAndDateBetweenOrderByDateAsc(user, start, end);
    }
}
