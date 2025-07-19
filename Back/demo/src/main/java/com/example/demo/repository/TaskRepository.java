package com.example.demo.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.Task;

//JPA Repository para la entidad Task
//Proporciona métodos CRUD y consultas personalizadas para la entidad Task
//Task el tipo de entidad con la que trabajara
//Long el tipo de dato de la clave primaria de la entidad Task

public interface  TaskRepository extends JpaRepository<Task, Long> {
    // Aquí puedes definir métodos personalizados si es necesario
    List<Task> findByDate(LocalDate date);


}
