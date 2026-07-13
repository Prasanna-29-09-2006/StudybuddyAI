package com.studybuddy.repository;

import com.studybuddy.model.Reminder;
import com.studybuddy.model.ReminderStatus;
import com.studybuddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for Reminder entities.
 */
@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    /**
     * Fetch all reminders belonging to the given user, ordered by date then time.
     */
    List<Reminder> findByUserOrderByReminderDateAscReminderTimeAsc(User user);

    /**
     * Fetch all reminders with the given status (used by the scheduler).
     */
    List<Reminder> findByStatus(ReminderStatus status);
}
