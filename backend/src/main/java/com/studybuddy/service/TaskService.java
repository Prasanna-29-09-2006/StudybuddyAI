package com.studybuddy.service;

import com.studybuddy.model.Task;
import com.studybuddy.model.User;
import com.studybuddy.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final StudyProgressService progressService;

    public TaskService(TaskRepository taskRepository, StudyProgressService progressService) {
        this.taskRepository = taskRepository;
        this.progressService = progressService;
    }

    public List<Task> getAllTasks(User user) {
        return taskRepository.findByUser(user);
    }

    public List<Task> searchTasks(User user, String status, String keyword) {
        String st = (status == null || status.trim().isEmpty()) ? null : status;
        String kw = (keyword == null || keyword.trim().isEmpty()) ? null : keyword;
        return taskRepository.searchTasks(user, st, kw);
    }

    public Optional<Task> getTaskById(Long id, User user) {
        return taskRepository.findById(id)
                .filter(task -> task.getUser().getId().equals(user.getId()));
    }

    public Task createTask(Task task, User user) {
        task.setUser(user);
        if (task.getStatus() == null) {
            task.setStatus("Pending");
        }
        return taskRepository.save(task);
    }

    public Task updateTask(Long id, Task taskDetails, User user) {
        Task task = getTaskById(id, user)
                .orElseThrow(() -> new RuntimeException("Task not found."));

        String oldStatus = task.getStatus();
        
        task.setTitle(taskDetails.getTitle());
        task.setDescription(taskDetails.getDescription());
        task.setDueDate(taskDetails.getDueDate());
        
        if (taskDetails.getStatus() != null) {
            task.setStatus(taskDetails.getStatus());
        }

        Task savedTask = taskRepository.save(task);

        // If task is completed and was not previously, log progress
        if ("Completed".equals(savedTask.getStatus()) && !"Completed".equals(oldStatus)) {
            progressService.incrementTasksCompleted(user);
        }

        return savedTask;
    }

    public void deleteTask(Long id, User user) {
        Task task = getTaskById(id, user)
                .orElseThrow(() -> new RuntimeException("Task not found."));
        taskRepository.delete(task);
    }
}
