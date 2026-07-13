package com.studybuddy.controller;

import com.studybuddy.model.User;
import com.studybuddy.service.DashboardService;
import com.studybuddy.service.GeminiService;
import com.studybuddy.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {

    private final GeminiService geminiService;
    private final UserService userService;
    private final DashboardService dashboardService;

    public AIController(GeminiService geminiService, UserService userService, DashboardService dashboardService) {
        this.geminiService = geminiService;
        this.userService = userService;
        this.dashboardService = dashboardService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    @PostMapping("/ask")
    public ResponseEntity<Map<String, String>> askQuestion(@RequestBody Map<String, String> request) {
        String question = request.get("question");
        String answer = geminiService.askGeneralQuestion(question);
        
        Map<String, String> response = new HashMap<>();
        response.put("response", answer);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/quiz")
    public ResponseEntity<String> generateQuiz(@RequestBody Map<String, Object> request) {
        String subject = (String) request.get("subject");
        String difficulty = (String) request.get("difficulty");
        int numQuestions = Integer.parseInt(request.get("numQuestions").toString());
        
        String quizJson = geminiService.generateQuiz(subject, difficulty, numQuestions);
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(quizJson);
    }

    @PostMapping("/flashcards")
    public ResponseEntity<String> generateFlashcards(@RequestBody Map<String, String> request) {
        String content = request.get("content");
        String flashcardsJson = geminiService.generateFlashcards(content);
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(flashcardsJson);
    }

    @PostMapping("/summarize")
    public ResponseEntity<String> summarizeContent(@RequestBody Map<String, String> request) {
        String content = request.get("content");
        String summaryJson = geminiService.generateSummary(content);
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(summaryJson);
    }

    @GetMapping("/recommendations")
    public ResponseEntity<Map<String, String>> getRecommendations() {
        User user = getAuthenticatedUser();
        Map<String, Object> stats = dashboardService.getDashboardStats(user);
        
        // Build a text representation of the stats for the LLM prompt
        StringBuilder progressStats = new StringBuilder();
        progressStats.append("Student stats:\n");
        progressStats.append("- Name: ").append(user.getName()).append("\n");
        progressStats.append("- Total Notes: ").append(stats.get("totalNotes")).append("\n");
        progressStats.append("- Completed Tasks: ").append(stats.get("completedTasks")).append("\n");
        progressStats.append("- Pending Tasks: ").append(stats.get("pendingTasks")).append("\n");
        progressStats.append("- Total Study Plans Scheduled: ").append(stats.get("totalPlans")).append("\n");
        progressStats.append("- Total Study Hours Logged This Week: ").append(stats.get("totalWeeklyHours")).append(" hours\n");
        progressStats.append("- Recent Activity logs: ").append(stats.get("recentActivities")).append("\n");

        String recommendations = geminiService.getStudyRecommendations(progressStats.toString());
        
        Map<String, String> response = new HashMap<>();
        response.put("recommendations", recommendations);
        return ResponseEntity.ok(response);
    }
}
