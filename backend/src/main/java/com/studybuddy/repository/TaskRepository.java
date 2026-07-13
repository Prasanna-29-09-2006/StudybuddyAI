package com.studybuddy.repository;

import com.studybuddy.model.Task;
import com.studybuddy.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUser(User user);
    
    @Query("SELECT t FROM Task t WHERE t.user = :user AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:keyword IS NULL OR t.title LIKE %:keyword% OR t.description LIKE %:keyword%)")
    List<Task> searchTasks(@Param("user") User user, 
                           @Param("status") String status, 
                           @Param("keyword") String keyword);
}
