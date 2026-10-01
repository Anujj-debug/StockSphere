package com.retail.app.service;

import com.retail.app.dto.SprintEpicDTO;
import com.retail.app.entity.SprintEpicLog;
import com.retail.app.enums.UserRole;
import com.retail.app.repository.SprintEpicLogRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AgileTraceabilityService {

    private final SprintEpicLogRepository sprintEpicLogRepository;

    public AgileTraceabilityService(SprintEpicLogRepository sprintEpicLogRepository) {
        this.sprintEpicLogRepository = sprintEpicLogRepository;
    }

    public List<SprintEpicDTO> getAllSprintsAndEpics() {
        return sprintEpicLogRepository.findAllByOrderBySprintNumberAsc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<SprintEpicDTO> getSprintsByEpic(Integer epicNumber) {
        return sprintEpicLogRepository.findByEpicNumberOrderBySprintNumberAsc(epicNumber).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getAgileRolesAndResponsibilities() {
        Map<String, Object> roles = new LinkedHashMap<>();

        roles.put("PRODUCT_OWNER", Map.of(
                "title", "Product Owner",
                "responsibilities", List.of(
                        "Defines retail inventory vision and prioritizes the Product Backlog across the 8 Epics",
                        "Acceptance criteria validation for catalog, pricing, order fulfillment, and multi-warehouse logic",
                        "Stakeholder alignment with retail store operations and warehouse logistics"
                )
        ));

        roles.put("SCRUM_MASTER", Map.of(
                "title", "Scrum Master",
                "responsibilities", List.of(
                        "Facilitates 15 Sprints ceremonies (Sprint Planning, Daily Standups, Sprint Review, Retrospective)",
                        "Removes technical and workflow impediments during sprint delivery",
                        "Maintains team velocity, burn-down charts, and definition of done (DoD)"
                )
        ));

        roles.put("INVENTORY_MANAGER", Map.of(
                "title", "Inventory Manager",
                "responsibilities", List.of(
                        "Monitors multi-warehouse safety stock, reorder points, and out-of-stock risk alerts",
                        "Approves inter-warehouse stock transfers and reviews valuation reports",
                        "Audits cycle counts and authorizes physical stock adjustments"
                )
        ));

        roles.put("WAREHOUSE_STAFF", Map.of(
                "title", "Warehouse Operations Staff",
                "responsibilities", List.of(
                        "Executes picking, packing, and dispatch operations for sales orders",
                        "Receives Goods Received Notes (GRN) from purchase orders and updates stock bin locations",
                        "Conducts physical stock counts and records damaged goods write-offs"
                )
        ));

        roles.put("PURCHASING_OFFICER", Map.of(
                "title", "Purchasing & Procurement Officer",
                "responsibilities", List.of(
                        "Manages supplier catalog relationships, price agreements, and lead times",
                        "Creates, negotiates, and issues Purchase Orders (PO)",
                        "Tracks vendor fulfillment ratings and delivery lead time performance"
                )
        ));

        roles.put("SALES_AGENT", Map.of(
                "title", "Sales / Retail Associate",
                "responsibilities", List.of(
                        "Creates sales orders for retail customers and reserves inventory in real time",
                        "Tracks order fulfillment status from allocation to shipping and delivery",
                        "Handles customer inquiries and retail store replenishment requests"
                )
        ));

        return roles;
    }

    public SprintEpicDTO mapToDTO(SprintEpicLog log) {
        return new SprintEpicDTO(
                log.getId(),
                log.getEpicNumber(),
                log.getEpicTitle(),
                log.getSprintNumber(),
                log.getSprintName(),
                log.getRoleOwner(),
                log.getStoryPoints(),
                log.getStatus(),
                log.getDeliverablesSummary()
        );
    }
}
