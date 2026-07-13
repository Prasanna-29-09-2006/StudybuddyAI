package com.studybuddy.repository;

import com.studybuddy.model.Flashcard;
import com.studybuddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, Long> {
    List<Flashcard> findByUser(User user);
    List<Flashcard> findByUserAndSubject(User user, String subject);
}
