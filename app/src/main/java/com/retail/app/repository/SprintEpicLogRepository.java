package com.retail.app.repository;

import com.retail.app.entity.SprintEpicLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SprintEpicLogRepository extends JpaRepository<SprintEpicLog, Long> {
    List<SprintEpicLog> findAllByOrderBySprintNumberAsc();
    List<SprintEpicLog> findByEpicNumberOrderBySprintNumberAsc(Integer epicNumber);
}
