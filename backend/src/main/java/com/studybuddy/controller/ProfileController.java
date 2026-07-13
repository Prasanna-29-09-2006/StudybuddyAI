package com.studybuddy.controller;

import com.studybuddy.model.User;
import com.studybuddy.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public ProfileController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    @GetMapping
    public ResponseEntity<User> getProfile() {
        User user = getAuthenticatedUser();
        // Nullify password before returning
        user.setPassword(null);
        return ResponseEntity.ok(user);
    }

    @PutMapping
    public ResponseEntity<User> updateProfile(@RequestBody User profileDetails) {
        User user = getAuthenticatedUser();
        
        user.setName(profileDetails.getName());
        user.setUniversity(profileDetails.getUniversity());
        user.setCourse(profileDetails.getCourse());
        user.setSemester(profileDetails.getSemester());
        user.setProfilePicture(profileDetails.getProfilePicture());
        
        User updated = userService.save(user);
        updated.setPassword(null); // Hide password hash
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        User user = getAuthenticatedUser();
        String currentPassword = request.get("currentPassword");
        String newPassword = request.get("newPassword");
        
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Current password does not match.");
            return ResponseEntity.badRequest().body(response);
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userService.save(user);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Password changed successfully.");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteAccount() {
        User user = getAuthenticatedUser();
        userService.deleteById(user.getId());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Account deleted successfully.");
        return ResponseEntity.ok(response);
    }
}
