package com.studybuddy.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * JPA entity representing a study reminder.
 * Each reminder is owned by a User and targets a recipient email address.
 * The reminder table is auto-created by Hibernate on startup.
 */
@Entity
@Table(name = "reminders")
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The authenticated user who created this reminder (owner). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    /** Recipient email — can be any valid email address (Gmail, Outlook, Yahoo, etc.) */
    @Column(nullable = false)
    private String userEmail;

    /** Email subject line. */
    @Column(nullable = false)
    private String subject;

    /** Body text of the reminder message. */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String reminderMessage;

    /** The calendar date on which this reminder should fire. */
    @Column(nullable = false)
    private LocalDate reminderDate;

    /** The clock time (HH:mm) at which this reminder should fire. */
    @Column(nullable = false)
    private LocalTime reminderTime;

    /** Lifecycle status: PENDING until the email is successfully sent, then SENT. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReminderStatus status = ReminderStatus.PENDING;

    /** Timestamp of when this reminder record was created. */
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ── Constructors ────────────────────────────────────────────────────────────

    public Reminder() {}

    // ── Getters & Setters ───────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getReminderMessage() { return reminderMessage; }
    public void setReminderMessage(String reminderMessage) { this.reminderMessage = reminderMessage; }

    public LocalDate getReminderDate() { return reminderDate; }
    public void setReminderDate(LocalDate reminderDate) { this.reminderDate = reminderDate; }

    public LocalTime getReminderTime() { return reminderTime; }
    public void setReminderTime(LocalTime reminderTime) { this.reminderTime = reminderTime; }

    public ReminderStatus getStatus() { return status; }
    public void setStatus(ReminderStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
