package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Task;
import com.example.demo.service.TaskService;


@RestController // Indica que esta clase es un controlador REST
@RequestMapping("/api/tasks") // Define la ruta base para las operaciones de Task
@CrossOrigin(origins = "*") // Permite solicitudes desde cualquier origen (útil para desarrollo)

public class TaskController {
    
    @Autowired // Inyecta automáticamente la instancia de TaskService
    private TaskService taskService;

    @GetMapping
    public List<Task> getAllTasks() { // Obtiene todas las tareas
        return taskService.getAllTasks();
    }
    
    //Usa @RequestBody para recibir el objeto JSON desde el frontend.

    @PostMapping
    public Task createTask(@RequestBody Task task) { // Crea una nueva tarea
        return taskService.createTask(task);
    }

// Usa @PathVariable para extraer el id
// Usa @RequestBody para recibir los nuevos datos de la tarea.

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable Long id, @RequestBody Task taskDetails) {
        return taskService.updateTask(id, taskDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

}
