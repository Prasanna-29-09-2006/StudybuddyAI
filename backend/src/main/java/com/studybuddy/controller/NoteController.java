package com.studybuddy.controller;

import com.studybuddy.model.Note;
import com.studybuddy.model.User;
import com.studybuddy.service.NoteService;
import com.studybuddy.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "http://localhost:5173")
public class NoteController {

    private final NoteService noteService;
    private final UserService userService;

    public NoteController(NoteService noteService, UserService userService) {
        this.noteService = noteService;
        this.userService = userService;
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found."));
    }

    @GetMapping
    public ResponseEntity<List<Note>> getNotes(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String keyword) {
        User user = getAuthenticatedUser();
        if ((subject != null && !subject.isEmpty()) || (keyword != null && !keyword.isEmpty())) {
            return ResponseEntity.ok(noteService.searchNotes(user, subject, keyword));
        }
        return ResponseEntity.ok(noteService.getAllNotes(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Note> getNoteById(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        return noteService.getNoteById(id, user)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Note> createNote(@RequestBody Note note) {
        User user = getAuthenticatedUser();
        return ResponseEntity.ok(noteService.createNote(note, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Note> updateNote(@PathVariable Long id, @RequestBody Note noteDetails) {
        User user = getAuthenticatedUser();
        try {
            return ResponseEntity.ok(noteService.updateNote(id, noteDetails, user));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        try {
            noteService.deleteNote(id, user);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
