package com.retail.app.dto;

import com.retail.app.enums.UserRole;

public class SprintEpicDTO {
    private Long id;
    private Integer epicNumber;
    private String epicTitle;
    private Integer sprintNumber;
    private String sprintName;
    private UserRole roleOwner;
    private Integer storyPoints;
    private String status;
    private String deliverablesSummary;

    public SprintEpicDTO() {
    }

    public SprintEpicDTO(Long id, Integer epicNumber, String epicTitle, Integer sprintNumber,
                         String sprintName, UserRole roleOwner, Integer storyPoints,
                         String status, String deliverablesSummary) {
        this.id = id;
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
