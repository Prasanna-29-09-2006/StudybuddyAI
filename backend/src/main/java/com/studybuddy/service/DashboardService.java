package com.studybuddy.service;

import com.studybuddy.model.*;
import com.studybuddy.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final NoteRepository noteRepository;
    private final TaskRepository taskRepository;
    private final StudyPlanRepository studyPlanRepository;
    private final StudyProgressRepository progressRepository;

    public DashboardService(NoteRepository noteRepository,
                            TaskRepository taskRepository,
                            StudyPlanRepository studyPlanRepository,
                            StudyProgressRepository progressRepository) {
        this.noteRepository = noteRepository;
        this.taskRepository = taskRepository;
        this.studyPlanRepository = studyPlanRepository;
        this.progressRepository = progressRepository;
    }

    public Map<String, Object> getDashboardStats(User user) {
        Map<String, Object> stats = new HashMap<>();

        // Basic counts
        List<Note> notes = noteRepository.findByUser(user);
        List<Task> tasks = taskRepository.findByUser(user);
        List<StudyPlan> plans = studyPlanRepository.findByUser(user);

        long totalNotes = notes.size();
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> "Completed".equalsIgnoreCase(t.getStatus())).count();
        long pendingTasks = totalTasks - completedTasks;
        long totalPlans = plans.size();

        stats.put("totalNotes", totalNotes);
        stats.put("totalTasks", totalTasks);
        stats.put("completedTasks", completedTasks);
        stats.put("pendingTasks", pendingTasks);
        stats.put("totalPlans", totalPlans);

        // Weekly Study Hours (last 7 days)
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> weeklyHours = new ArrayList<>();
        double totalWeeklyHours = 0.0;
        
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            Optional<StudyProgress> progress = progressRepository.findByUserAndDate(user, date);
            double hours = progress.map(StudyProgress::getStudyHours).orElse(0.0);
            totalWeeklyHours += hours;

            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("day", date.getDayOfWeek().name().substring(0, 3));
            dayMap.put("hours", hours);
            weeklyHours.add(dayMap);
        }
        stats.put("weeklyHours", weeklyHours);
        stats.put("totalWeeklyHours", Math.round(totalWeeklyHours * 10.0) / 10.0);

        // Generate Recent Activities Feed
        List<Activity> activities = new ArrayList<>();

        // Add Notes activities
        notes.stream()
                .sorted(Comparator.comparing(Note::getCreatedAt).reversed())
                .limit(5)
                .forEach(n -> activities.add(new Activity("note", "Created note: " + n.getTitle(), n.getCreatedAt())));

        // Add Tasks activities
        tasks.stream()
                .sorted(Comparator.comparing(Task::getCreatedAt).reversed())
                .limit(5)
                .forEach(t -> {
                    String desc = "Completed".equalsIgnoreCase(t.getStatus()) ?
                            "Completed task: " + t.getTitle() : "Created task: " + t.getTitle();
                    activities.add(new Activity("task", desc, t.getCreatedAt()));
                });

        // Add Study Plans activities
        plans.stream()
                .sorted(Comparator.comparing(StudyPlan::getCreatedAt).reversed())
                .limit(5)
                .forEach(p -> activities.add(new Activity("plan", "Scheduled study plan for " + p.getSubject(), p.getCreatedAt())));

        // Sort combined activities by time
        List<Map<String, String>> sortedActivities = activities.stream()
                .sorted(Comparator.comparing(Activity::getTime).reversed())
                .limit(5)
                .map(a -> {
                    Map<String, String> map = new HashMap<>();
                    map.put("type", a.getType());
                    map.put("description", a.getDescription());
                    map.put("time", formatRelativeTime(a.getTime()));
                    return map;
                })
                .collect(Collectors.toList());

        stats.put("recentActivities", sortedActivities);

        // Generate a random motivational quote
        String[] quotes = {
            "The secret of getting ahead is getting started. — Mark Twain",
            "It always seems impossible until it's done. — Nelson Mandela",
            "Success is the sum of small efforts, repeated day in and day out. — Robert Collier",
            "Don't wish it were easier. Wish you were better. — Jim Rohn",
            "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice. — Brian Herbert",
            "Your attitude, not your aptitude, will determine your altitude. — Zig Ziglar"
        };
        stats.put("quote", quotes[new Random().nextInt(quotes.length)]);

        return stats;
    }

    private String formatRelativeTime(LocalDateTime time) {
        LocalDateTime now = LocalDateTime.now();
        long diffInSeconds = java.time.Duration.between(time, now).getSeconds();
        if (diffInSeconds < 60) return "Just now";
        long diffInMinutes = diffInSeconds / 60;
        if (diffInMinutes < 60) return diffInMinutes + " mins ago";
        long diffInHours = diffInMinutes / 60;
        if (diffInHours < 24) return diffInHours + " hours ago";
        return time.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"));
    }

    // Helper static class to aggregate activities
    private static class Activity {
        private final String type;
        private final String description;
        private final LocalDateTime time;

        public Activity(String type, String description, LocalDateTime time) {
            this.type = type;
            this.description = description;
            this.time = time;
        }

        public String getType() { return type; }
        public String getDescription() { return description; }
        public LocalDateTime getTime() { return time; }
    }
}
