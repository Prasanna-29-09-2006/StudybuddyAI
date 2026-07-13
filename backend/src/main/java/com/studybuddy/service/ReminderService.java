package com.studybuddy.service;

import com.studybuddy.model.Reminder;
import com.studybuddy.model.ReminderStatus;
import com.studybuddy.model.User;
import com.studybuddy.repository.ReminderRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service layer for Reminder management.
 * Handles CRUD operations, immediate email dispatch,
 * and an automated scheduler that fires every minute.
 */
@Service
public class ReminderService {

    private static final Logger log = LoggerFactory.getLogger(ReminderService.class);

    private final ReminderRepository reminderRepository;
    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${spring.mail.password}")
    private String senderPassword;

    public ReminderService(ReminderRepository reminderRepository, JavaMailSender mailSender) {
        this.reminderRepository = reminderRepository;
        this.mailSender = mailSender;
    }

    // ── CRUD ────────────────────────────────────────────────────────────────────

    /** Create and persist a new reminder. */
    public Reminder createReminder(Reminder reminder, User owner) {
        reminder.setUser(owner);
        reminder.setStatus(ReminderStatus.PENDING);
        return reminderRepository.save(reminder);
    }

    /** Retrieve all reminders belonging to the given user, ordered by date/time. */
    public List<Reminder> getRemindersForUser(User user) {
        return reminderRepository.findByUserOrderByReminderDateAscReminderTimeAsc(user);
    }

    /** Update an existing reminder (only if owned by the given user). */
    public Reminder updateReminder(Long id, Reminder updated, User owner) {
        Reminder existing = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found with id: " + id));

        if (!existing.getUser().getId().equals(owner.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this reminder.");
        }

        existing.setUserEmail(updated.getUserEmail());
        existing.setSubject(updated.getSubject());
        existing.setReminderMessage(updated.getReminderMessage());
        existing.setReminderDate(updated.getReminderDate());
        existing.setReminderTime(updated.getReminderTime());
        // Reset to PENDING so the scheduler can re-fire at the new time
        existing.setStatus(ReminderStatus.PENDING);
        return reminderRepository.save(existing);
    }

    /** Delete a reminder (only if owned by the given user). */
    public void deleteReminder(Long id, User owner) {
        Reminder existing = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found with id: " + id));

        if (!existing.getUser().getId().equals(owner.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this reminder.");
        }
        reminderRepository.delete(existing);
    }

    // ── Email Dispatch ──────────────────────────────────────────────────────────

    /**
     * Immediately send the reminder email for the given reminder ID.
     * Updates status to SENT on success.
     */
    public void sendNow(Long id, User owner) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found with id: " + id));

        if (!reminder.getUser().getId().equals(owner.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this reminder.");
        }

        sendEmail(reminder);
        reminder.setStatus(ReminderStatus.SENT);
        reminderRepository.save(reminder);
        log.info("✅ Reminder email sent immediately to {} | Subject: {}", reminder.getUserEmail(), reminder.getSubject());
    }

    // ── Scheduler ───────────────────────────────────────────────────────────────

    /**
     * Runs every minute (cron: second=0, any minute/hour/day).
     * Checks all PENDING reminders; those whose scheduled date+time has
     * arrived or passed are dispatched and marked SENT.
     */
    @Scheduled(cron = "0 * * * * *")
    public void processPendingReminders() {
        List<Reminder> pending = reminderRepository.findByStatus(ReminderStatus.PENDING);
        if (pending.isEmpty()) return;

        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);

        for (Reminder reminder : pending) {
            LocalDateTime scheduled = LocalDateTime.of(reminder.getReminderDate(), reminder.getReminderTime());
            if (!scheduled.isAfter(now)) {
                try {
                    sendEmail(reminder);
                    reminder.setStatus(ReminderStatus.SENT);
                    reminderRepository.save(reminder);
                    log.info("⏰ Scheduled reminder sent to {} | Subject: {}", reminder.getUserEmail(), reminder.getSubject());
                } catch (Exception e) {
                    log.error("❌ Failed to send reminder id={}: {}", reminder.getId(), e.getMessage());
                }
            }
        }
    }

    // ── Private Helpers ─────────────────────────────────────────────────────────

    /**
     * Build and dispatch a professional HTML reminder email.
     */
    private void sendEmail(Reminder reminder) {
        if (senderEmail == null || senderEmail.isBlank() || "your_gmail@gmail.com".equals(senderEmail) ||
            senderPassword == null || senderPassword.isBlank() || "your_app_password_here".equals(senderPassword)) {
            throw new RuntimeException("SMTP email credentials are not configured. Please set SMTP_EMAIL and SMTP_PASSWORD environment variables or update application.properties with your Gmail details.");
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail);
            helper.setTo(reminder.getUserEmail());
            helper.setSubject("📚 Study Buddy Reminder: " + reminder.getSubject());
            helper.setText(buildHtmlTemplate(reminder), true); // true = HTML

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    /**
     * Build a responsive, professional HTML email template for the reminder.
     */
    private String buildHtmlTemplate(Reminder reminder) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMMM dd, yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");

        String formattedDate = reminder.getReminderDate().format(dateFormatter);
        String formattedTime = reminder.getReminderTime().format(timeFormatter);

        return "<!DOCTYPE html>" +
            "<html lang='en'>" +
            "<head>" +
            "<meta charset='UTF-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "<title>Study Buddy Reminder</title>" +
            "</head>" +
            "<body style='margin:0;padding:0;font-family:\"Segoe UI\",Arial,sans-serif;background:#0f172a;'>" +
            "<table width='100%' cellpadding='0' cellspacing='0' style='background:#0f172a;padding:40px 0;'>" +
            "  <tr><td align='center'>" +
            "    <table width='600' cellpadding='0' cellspacing='0' style='background:#1e293b;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.5);'>" +
            // Header
            "      <tr>" +
            "        <td style='background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:36px 40px;text-align:center;'>" +
            "          <div style='font-size:36px;margin-bottom:8px;'>🧠</div>" +
            "          <h1 style='margin:0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;'>Study Buddy AI</h1>" +
            "          <p style='margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;'>Your Personal AI Learning Companion</p>" +
            "        </td>" +
            "      </tr>" +
            // Body
            "      <tr>" +
            "        <td style='padding:40px;'>" +
            "          <p style='margin:0 0 24px;color:#94a3b8;font-size:15px;'>Hello,</p>" +
            "          <p style='margin:0 0 28px;color:#e2e8f0;font-size:16px;line-height:1.7;'>" +
            "            This is your scheduled <strong style='color:#60a5fa;'>study reminder</strong> from Study Buddy AI. Time to focus and make progress! 🎯" +
            "          </p>" +
            // Subject card
            "          <div style='background:#0f172a;border-radius:12px;padding:24px;margin-bottom:16px;border-left:4px solid #3b82f6;'>" +
            "            <p style='margin:0 0 6px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;'>Subject</p>" +
            "            <p style='margin:0;color:#f1f5f9;font-size:18px;font-weight:700;'>" + escapeHtml(reminder.getSubject()) + "</p>" +
            "          </div>" +
            // Message card
            "          <div style='background:#0f172a;border-radius:12px;padding:24px;margin-bottom:16px;border-left:4px solid #8b5cf6;'>" +
            "            <p style='margin:0 0 6px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;'>Message</p>" +
            "            <p style='margin:0;color:#cbd5e1;font-size:15px;line-height:1.7;'>" + escapeHtml(reminder.getReminderMessage()) + "</p>" +
            "          </div>" +
            // Date/Time card
            "          <div style='background:#0f172a;border-radius:12px;padding:24px;margin-bottom:32px;border-left:4px solid #10b981;'>" +
            "            <p style='margin:0 0 6px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;'>Scheduled For</p>" +
            "            <p style='margin:0;color:#6ee7b7;font-size:15px;font-weight:600;'>📅 " + formattedDate + " &nbsp;·&nbsp; ⏰ " + formattedTime + "</p>" +
            "          </div>" +
            // Motivational quote
            "          <div style='background:linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1));border:1px solid rgba(59,130,246,0.2);border-radius:12px;padding:20px;margin-bottom:28px;text-align:center;'>" +
            "            <p style='margin:0;color:#93c5fd;font-size:14px;font-style:italic;line-height:1.6;'>\"The secret of getting ahead is getting started.\" — Mark Twain</p>" +
            "          </div>" +
            "          <p style='margin:0;color:#94a3b8;font-size:14px;line-height:1.7;'>Stay consistent, stay curious, and keep learning. You've got this! 🚀</p>" +
            "        </td>" +
            "      </tr>" +
            // Footer
            "      <tr>" +
            "        <td style='background:#0f172a;padding:24px 40px;text-align:center;border-top:1px solid #1e293b;'>" +
            "          <p style='margin:0 0 6px;color:#475569;font-size:13px;'>Sent by <strong style='color:#60a5fa;'>Study Buddy AI</strong></p>" +
            "          <p style='margin:0;color:#334155;font-size:12px;'>This is an automated reminder. Please do not reply to this email.</p>" +
            "        </td>" +
            "      </tr>" +
            "    </table>" +
            "  </td></tr>" +
            "</table>" +
            "</body></html>";
    }

    /** Escape HTML special characters to prevent injection in email content. */
    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#x27;");
    }
}
