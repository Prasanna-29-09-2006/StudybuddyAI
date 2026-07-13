package com.studybuddy.model;

/**
 * Enum representing the lifecycle status of a study reminder.
 * PENDING: Reminder has been scheduled but not yet sent.
 * SENT:    Reminder email has been successfully dispatched.
 */
public enum ReminderStatus {
    PENDING,
    SENT
}
