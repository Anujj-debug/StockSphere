package com.retail.app.controller;

import com.retail.app.dto.SprintEpicDTO;
import com.retail.app.service.AgileTraceabilityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agile")
@CrossOrigin(origins = "*")
public class AgileCaseStudyController {

    private final AgileTraceabilityService agileService;

    public AgileCaseStudyController(AgileTraceabilityService agileService) {
        this.agileService = agileService;
    }

    @GetMapping("/sprints-epics")
    public ResponseEntity<List<SprintEpicDTO>> getAllSprintsAndEpics() {
        return ResponseEntity.ok(agileService.getAllSprintsAndEpics());
    }

    @GetMapping("/sprints-epics/epic/{epicNumber}")
    public ResponseEntity<List<SprintEpicDTO>> getSprintsByEpic(@PathVariable Integer epicNumber) {
        return ResponseEntity.ok(agileService.getSprintsByEpic(epicNumber));
    }

    @GetMapping("/roles")
    public ResponseEntity<Map<String, Object>> getAgileRoles() {
        return ResponseEntity.ok(agileService.getAgileRolesAndResponsibilities());
    }
}
