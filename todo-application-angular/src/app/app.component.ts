import { Component, OnInit } from '@angular/core';
import { TodoService } from './todos/todo.service';
import { Todo } from './todos/todo';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop'; // Import DragDropModule here
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { FormsModule } from '@angular/forms'; // For ngModel
import { CommonModule } from '@angular/common'; // Needed for ngIf, ngFor

// Angular Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, // For ngIf, ngFor
    HttpClientModule,
    FormsModule,

    // Angular Material Modules
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,

    // Angular CDK Modules
    DragDropModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Angular To-Do App';
  todos: Todo[] = [];
  newTodoTitle: string = '';

  constructor(private todoService: TodoService) { }

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.todoService.getTodos().subscribe(
      (data) => {
        this.todos = data;
      },
      (error) => {
        console.error('Error loading todos:', error);
      }
    );
  }

  addTodo(): void {
    if (this.newTodoTitle.trim()) {
      const newTodo: Todo = {
        id: 0, // ID will be assigned by the backend
        title: this.newTodoTitle,
        isComplete: false
      };
      this.todoService.addTodo(newTodo).subscribe(
        (todo) => {
          this.todos.push(todo);
          this.newTodoTitle = '';
        },
        (error) => {
          console.error('Error adding todo:', error);
        }
      );
    }
  }

  updateTodoStatus(todo: Todo): void {
    // Toggle the status locally for immediate feedback
    todo.isComplete = !todo.isComplete;
    this.todoService.updateTodo(todo.id, todo).subscribe(
      () => {
        console.log('Todo status updated successfully');
      },
      (error) => {
        console.error('Error updating todo status:', error);
        // Revert local change if API call fails
        todo.isComplete = !todo.isComplete;
      }
    );
  }

  deleteTodo(id: number): void {
    this.todoService.deleteTodo(id).subscribe(
      () => {
        this.todos = this.todos.filter(todo => todo.id !== id);
      },
      (error) => {
        console.error('Error deleting todo:', error);
      }
    );
  }

  drop(event: CdkDragDrop<Todo[]>): void {
    moveItemInArray(this.todos, event.previousIndex, event.currentIndex);
    // Note: For a real-world application, you would also need to send
    // an API request to update the order on the backend.
    // This tutorial focuses on front-end drag-and-drop.
    console.log('Todo reordered:', this.todos);
  }
}