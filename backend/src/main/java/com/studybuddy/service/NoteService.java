package com.studybuddy.service;

import com.studybuddy.model.Note;
import com.studybuddy.model.User;
import com.studybuddy.repository.NoteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NoteService {

    private final NoteRepository noteRepository;
    private final StudyProgressService progressService;

    public NoteService(NoteRepository noteRepository, StudyProgressService progressService) {
        this.noteRepository = noteRepository;
        this.progressService = progressService;
    }

    public List<Note> getAllNotes(User user) {
        return noteRepository.findByUser(user);
    }

    public List<Note> searchNotes(User user, String subject, String keyword) {
        // Map empty strings to null for JPA query parameter matching
        String sub = (subject == null || subject.trim().isEmpty()) ? null : subject;
        String kw = (keyword == null || keyword.trim().isEmpty()) ? null : keyword;
        return noteRepository.searchNotes(user, sub, kw);
    }

    public Optional<Note> getNoteById(Long id, User user) {
        return noteRepository.findById(id)
                .filter(note -> note.getUser().getId().equals(user.getId()));
    }

    public Note createNote(Note note, User user) {
        note.setUser(user);
        Note savedNote = noteRepository.save(note);
        progressService.incrementNotesCreated(user);
        return savedNote;
    }

    public Note updateNote(Long id, Note noteDetails, User user) {
        Note note = getNoteById(id, user)
                .orElseThrow(() -> new RuntimeException("Note not found."));

        note.setTitle(noteDetails.getTitle());
        note.setSubject(noteDetails.getSubject());
        note.setContent(noteDetails.getContent());
        return noteRepository.save(note);
    }

    public void deleteNote(Long id, User user) {
        Note note = getNoteById(id, user)
                .orElseThrow(() -> new RuntimeException("Note not found."));
        noteRepository.delete(note);
    }
}
