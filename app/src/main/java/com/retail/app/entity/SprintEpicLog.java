package com.retail.app.entity;

import com.retail.app.enums.UserRole;
import jakarta.persistence.*;

@Entity
@Table(name = "sprint_epic_logs")
public class SprintEpicLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "epic_number", nullable = false)
    private Integer epicNumber;

    @Column(name = "epic_title", nullable = false, length = 150)
    private String epicTitle;

    @Column(name = "sprint_number", nullable = false)
    private Integer sprintNumber;

    @Column(name = "sprint_name", nullable = false, length = 150)
    private String sprintName;

    @Enumerated(EnumType.STRING)
    @Column(name = "role_owner", nullable = false, length = 30)
    private UserRole roleOwner;

    @Column(name = "story_points", nullable = false)
    private Integer storyPoints;

    @Column(nullable = false, length = 30)
    private String status = "COMPLETED";

    @Column(name = "deliverables_summary", length = 500)
    private String deliverablesSummary;

    public SprintEpicLog() {
    }

    public SprintEpicLog(Integer epicNumber, String epicTitle, Integer sprintNumber,
                         String sprintName, UserRole roleOwner, Integer storyPoints,
                         String status, String deliverablesSummary) {
        this.epicNumber = epicNumber;
        this.epicTitle = epicTitle;
        this.sprintNumber = sprintNumber;
        this.sprintName = sprintName;
        this.roleOwner = roleOwner;
        this.storyPoints = storyPoints;
        this.status = status;
        this.deliverablesSummary = deliverablesSummary;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getEpicNumber() {
        return epicNumber;
    }

    public void setEpicNumber(Integer epicNumber) {
        this.epicNumber = epicNumber;
    }

    public String getEpicTitle() {
        return epicTitle;
    }

    public void setEpicTitle(String epicTitle) {
        this.epicTitle = epicTitle;
    }

    public Integer getSprintNumber() {
        return sprintNumber;
    }

    public void setSprintNumber(Integer sprintNumber) {
        this.sprintNumber = sprintNumber;
    }

    public String getSprintName() {
        return sprintName;
    }

    public void setSprintName(String sprintName) {
        this.sprintName = sprintName;
    }

    public UserRole getRoleOwner() {
        return roleOwner;
    }

    public void setRoleOwner(UserRole roleOwner) {
        this.roleOwner = roleOwner;
    }

    public Integer getStoryPoints() {
        return storyPoints;
    }

    public void setStoryPoints(Integer storyPoints) {
        this.storyPoints = storyPoints;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDeliverablesSummary() {
        return deliverablesSummary;
    }

    public void setDeliverablesSummary(String deliverablesSummary) {
        this.deliverablesSummary = deliverablesSummary;
    }
}
