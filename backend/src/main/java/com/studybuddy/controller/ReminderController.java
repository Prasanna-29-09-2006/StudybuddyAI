package com.studybuddy.controller;

import com.studybuddy.model.Reminder;
import com.studybuddy.model.User;
import com.studybuddy.repository.UserRepository;
import com.studybuddy.service.ReminderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

/**
 * REST Controller exposing CRUD and immediate-send endpoints for Reminders.
 * All endpoints require a valid JWT token (enforced by SecurityConfig).
 * Base path: /api/reminders
 */
@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    // RFC 5322 compliant email regex — accepts Gmail, Outlook, Yahoo, iCloud, ProtonMail, etc.
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$"
    );

    private final ReminderService reminderService;
    private final UserRepository userRepository;

    public ReminderController(ReminderService reminderService, UserRepository userRepository) {
        this.reminderService = reminderService;
        this.userRepository = userRepository;
    }

    // ── Helper: resolve authenticated user ──────────────────────────────────────
    private User getAuthenticatedUser(Authentication auth) {
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found: " + email));
    }

    // ── POST /api/reminders — Create Reminder ───────────────────────────────────
    @PostMapping
    public ResponseEntity<?> createReminder(@RequestBody Reminder reminder, Authentication auth) {
        try {
            // Validate required fields
            String validationError = validate(reminder, true);
            if (validationError != null) {
                return ResponseEntity.badRequest().body(Map.of("error", validationError));
            }

            User owner = getAuthenticatedUser(auth);
            Reminder created = reminderService.createReminder(reminder, owner);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── GET /api/reminders — Get all reminders for the authenticated user ────────
    @GetMapping
    public ResponseEntity<?> getReminders(Authentication auth) {
        try {
            User owner = getAuthenticatedUser(auth);
            List<Reminder> reminders = reminderService.getRemindersForUser(owner);
            return ResponseEntity.ok(reminders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── PUT /api/reminders/{id} — Update Reminder ────────────────────────────────
    @PutMapping("/{id}")
    public ResponseEntity<?> updateReminder(@PathVariable Long id,
                                            @RequestBody Reminder reminder,
                                            Authentication auth) {
        try {
            String validationError = validate(reminder, false);
            if (validationError != null) {
                return ResponseEntity.badRequest().body(Map.of("error", validationError));
            }

            User owner = getAuthenticatedUser(auth);
            Reminder updated = reminderService.updateReminder(id, reminder, owner);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── DELETE /api/reminders/{id} — Delete Reminder ─────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReminder(@PathVariable Long id, Authentication auth) {
        try {
            User owner = getAuthenticatedUser(auth);
            reminderService.deleteReminder(id, owner);
            return ResponseEntity.ok(Map.of("message", "Reminder deleted successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── POST /api/reminders/{id}/send — Send Reminder Email Immediately ──────────
    @PostMapping("/{id}/send")
    public ResponseEntity<?> sendNow(@PathVariable Long id, Authentication auth) {
        try {
            User owner = getAuthenticatedUser(auth);
            reminderService.sendNow(id, owner);
            return ResponseEntity.ok(Map.of("message", "Reminder email sent successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unable to send reminder email: " + e.getMessage()));
        }
    }

    // ── Validation ───────────────────────────────────────────────────────────────

    /**
     * Validate a Reminder request body.
     * @param reminder        the reminder to validate
     * @param checkFutureTime if true, enforces that date/time is not in the past
     * @return null if valid, or an error message string
     */
    private String validate(Reminder reminder, boolean checkFutureTime) {
        if (reminder.getUserEmail() == null || reminder.getUserEmail().isBlank()) {
            return "Recipient email is required.";
        }
        if (!EMAIL_PATTERN.matcher(reminder.getUserEmail().trim()).matches()) {
            return "Invalid email address format.";
        }
        if (reminder.getSubject() == null || reminder.getSubject().isBlank()) {
            return "Subject is required.";
        }
        if (reminder.getReminderMessage() == null || reminder.getReminderMessage().isBlank()) {
            return "Reminder message is required.";
        }
        if (reminder.getReminderDate() == null) {
            return "Reminder date is required.";
        }
        if (reminder.getReminderTime() == null) {
            return "Reminder time is required.";
        }

        if (checkFutureTime) {
            LocalDate today = LocalDate.now();
            LocalTime nowTime = LocalTime.now();

            if (reminder.getReminderDate().isBefore(today)) {
                return "Reminder date cannot be in the past.";
            }
            if (reminder.getReminderDate().isEqual(today) &&
                !reminder.getReminderTime().isAfter(nowTime)) {
                return "Reminder time cannot be in the past for today's date.";
            }
        }
        return null;
    }
}
