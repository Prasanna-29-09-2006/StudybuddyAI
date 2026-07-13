package com.studybuddy.repository;

import com.studybuddy.model.Note;
import com.studybuddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByUser(User user);
    
    @Query("SELECT n FROM Note n WHERE n.user = :user AND " +
           "(:subject IS NULL OR n.subject = :subject) AND " +
           "(:keyword IS NULL OR n.title LIKE %:keyword% OR n.content LIKE %:keyword%)")
    List<Note> searchNotes(@Param("user") User user, 
                           @Param("subject") String subject, 
                           @Param("keyword") String keyword);
}
