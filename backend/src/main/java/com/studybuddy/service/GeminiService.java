package com.studybuddy.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${gemini.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public GeminiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    public String generateContent(String prompt) {
        return generateContent(prompt, false);
    }

    public String generateContent(String prompt, boolean forceJson) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return "{\"error\": \"Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.\"}";
        }

        try {
            String url = apiUrl + "?key=" + apiKey;

            // Prepare the payload for Gemini 1.5/2.5 API
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> contentObj = new HashMap<>();
            contentObj.put("parts", List.of(textPart));

            Map<String, Object> payload = new HashMap<>();
            payload.put("contents", List.of(contentObj));

            if (forceJson) {
                Map<String, Object> generationConfig = new HashMap<>();
                generationConfig.put("responseMimeType", "application/json");
                payload.put("generationConfig", generationConfig);
            }

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return "{\"error\": \"Gemini API returned error code " + response.statusCode() + ": " + response.body().replace("\"", "\\\"") + "\"}";
            }

            // Extract the generated text from Gemini API response
            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode candidate = rootNode.path("candidates").path(0);
            JsonNode part = candidate.path("content").path("parts").path(0);
            String rawText = part.path("text").asText();

            return cleanJsonMarkdown(rawText);

        } catch (Exception e) {
            return "{\"error\": \"Failed to communicate with Gemini API: " + e.getMessage().replace("\"", "\\\"") + "\"}";
        }
    }

    // Helper to remove ```json ... ``` blocks that Gemini often wraps around JSON responses
    private String cleanJsonMarkdown(String input) {
        String trimmed = input.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }

    public String askGeneralQuestion(String question) {
        String prompt = "You are an advanced AI Tutor named Study Buddy AI. Respond in clear, readable markdown format. " +
                "Help the student with this query:\n\n" + question;
        return generateContent(prompt);
    }

    public String generateQuiz(String subject, String difficulty, int numQuestions) {
        String prompt = String.format(
                "Generate a multiple-choice quiz about '%s' with %d questions at '%s' difficulty level.\n" +
                "You MUST return ONLY a raw JSON array matching this format (no markdown blocks, no leading text, no trailing text):\n" +
                "[\n" +
                "  {\n" +
                "    \"question\": \"Question text here?\",\n" +
                "    \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],\n" +
                "    \"answer\": \"Option B\"\n" +
                "  }\n" +
                "]\n" +
                "Make sure the options are realistic and the 'answer' matches exactly one of the strings in the 'options' list.",
                subject, numQuestions, difficulty
        );
        return generateContent(prompt, true);
    }

    public String generateFlashcards(String content) {
        String prompt = "Generate a set of educational flashcards based on the following text.\n" +
                "You MUST return ONLY a raw JSON array of question-answer pairs matching this format (no markdown blocks, no leading text, no trailing text):\n" +
                "[\n" +
                "  {\n" +
                "    \"question\": \"Short question/term here?\",\n" +
                "    \"answer\": \"Clear, concise definition or answer here.\"\n" +
                "  }\n" +
                "]\n" +
                "Content:\n" + content;
        return generateContent(prompt, true);
    }

    public String generateSummary(String content) {
        String prompt = "Generate a summary, key points, and definitions for the following notes content.\n" +
                "You MUST return ONLY a raw JSON object matching this format (no markdown blocks, no leading text, no trailing text):\n" +
                "{\n" +
                "  \"summary\": \"A short paragraph summarizing the content.\",\n" +
                "  \"keyPoints\": [\n" +
                "    \"Key point 1...\",\n" +
                "    \"Key point 2...\"\n" +
                "  ],\n" +
                "  \"definitions\": [\n" +
                "    {\n" +
                "      \"term\": \"Concept Name\",\n" +
                "      \"definition\": \"Definition details...\"\n" +
                "    }\n" +
                "  ]\n" +
                "}\n" +
                "Content:\n" + content;
        return generateContent(prompt, true);
    }

    public String getStudyRecommendations(String progressStats) {
        String prompt = "Review this student's recent weekly study progress and tasks, and provide a set of study recommendations.\n" +
                "Respond in professional, encouraging markdown bullet points.\n" +
                "Data:\n" + progressStats;
        return generateContent(prompt);
    }
}
