# Angular To-Do Application Tutorial

This tutorial will guide you through building a front-end To-Do application using Angular, integrating it with the C# backend API created in the `C# TUTORIAL.md`. We will cover setting up Angular, making API calls, implementing a user interface with Angular Material, and adding drag-and-drop functionality using Angular CDK.

## Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js and npm (Node Package Manager):** Angular requires Node.js. You can download it from [nodejs.org](https://nodejs.org/). npm is included with Node.js.
*   **C# Backend API:** Make sure you have followed the `C# TUTORIAL.md` and have your .NET To-Do API running, preferably with Docker and Postgres as described in Phase 2. The API should be accessible at `http://localhost:5123` (or whatever port your `dotnet run` command indicates).

## Step 1: Install Angular CLI

The Angular CLI (Command Line Interface) is a powerful tool to create, manage, and build Angular applications.

```bash
npm install -g @angular/cli
```

Verify the installation:

```bash
ng version
```

## Step 2: Create a New Angular Project

Navigate to the directory where you want to create your Angular project (e.g., alongside your `TodoApiSolution` folder, but not inside it).

```bash
# Navigate to your desired parent directory
# For example, if TodoApiSolution is in ~/projects, you might do:
# cd ~/projects

ng new angular-todo-app --routing=false --style=scss

*   `angular-todo-app`: The name of your new project.
*   `--routing=false`: We won't be using Angular's built-in routing for this simple app.
*   `--style=scss`: Uses SCSS for styling.
*   **Standalone Components:** In newer Angular versions, components are standalone by default, meaning they can manage their own imports without needing an `NgModule`. This simplifies the project structure significantly.
```

*   `angular-todo-app`: The name of your new project.
*   `--routing=false`: We won't be using Angular's built-in routing for this simple app.
*   `--style=scss`: Uses SCSS for styling. You can choose `scss`, `sass`, or `less` if you prefer.

Navigate into your new project directory:

```bash
cd angular-todo-app
```

## Step 3: Install Angular Material and CDK

Angular Material provides UI components that implement Material Design. Angular CDK (Component Dev Kit) provides tools to build custom components, including drag and drop.

```bash
ng add @angular/material
```

Follow the prompts:
*   Choose a pre-built theme (e.g., "Indigo/Pink").
*   Set up global Angular Material typography styles: `Yes`
*   Include and enable animations: `Yes`

## Step 4: Integrate with the C# Backend API

We'll create a service to handle communication with our C# To-Do API.

### 4.1 Create a `Todo` Interface

Define the structure of a To-Do item.

Create a new file `src/app/todo.ts`:

```typescript
// src/app/todo.ts
export interface Todo {
  id: number;
  title: string;
  isComplete: boolean;
}
```

### 4.2 Create a To-Do Service

Generate a service to encapsulate API calls.

```bash
ng generate service todo
```

Update `src/app/todo.service.ts`:

```typescript
// src/app/todo.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo } from './todo'; // Import the Todo interface

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = 'http://localhost:5123/todos'; // Adjust if your backend port is different

  constructor(private http: HttpClient) { }

  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl);
  }

  addTodo(todo: Todo): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, todo);
  }

  updateTodo(id: number, todo: Todo): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, todo);
  }

  deleteTodo(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
```

### 4.3 Update `main.ts` for Standalone Bootstrapping

With standalone components, `app.module.ts` is no longer needed to bootstrap the application. Instead, `main.ts` directly bootstraps the `AppComponent` and provides necessary global configurations.

Open `src/main.ts` and ensure it looks similar to this:

```typescript
// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideAnimations()
  ]




```

This sets up the `HttpClient` and browser animations globally for your standalone application.




```

## Step 5: Build the UI with Angular Material and CDK Drag and Drop

We'll modify the main `AppComponent` to display and manage To-Do items.

### 5.1 Update `app.component.ts`

This component will hold the logic for fetching, adding, updating, deleting, and reordering To-Do items. The `standalone: true` flag and the `imports` array are crucial here.

```typescript
// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { TodoService } from './todo.service';
import { Todo } from './todo';
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
```

### 5.2 Update `app.component.html`

This template will use Angular Material components and CDK Drag and Drop directives.

```html
<!-- src/app/app.component.html -->
<mat-toolbar color="primary">
  <span>{{ title }}</span>
</mat-toolbar>

<div class="container">
  <mat-card class="todo-input-card">
    <mat-card-content>
      <mat-form-field appearance="fill" class="full-width-input">
        <mat-label>New To-Do</mat-label>
        <input matInput [(ngModel)]="newTodoTitle" (keyup.enter)="addTodo()" placeholder="What needs to be done?">
      </mat-form-field>
      <button mat-raised-button color="accent" (click)="addTodo()">Add To-Do</button>
    </mat-card-content>
  </mat-card>

  <mat-card class="todo-list-card">
    <mat-card-header>
      <mat-card-title>My To-Do List</mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <div cdkDropList class="todo-list" (cdkDropListDropped)="drop($event)">
        <mat-card *ngIf="todos.length === 0" class="no-todos-message">
          <mat-card-content>
            No To-Do items yet. Add one above!
          </mat-card-content>
        </mat-card>

        <mat-card *ngFor="let todo of todos" cdkDrag class="todo-item" [class.completed]="todo.isComplete">
          <div class="todo-content">
            <mat-checkbox [checked]="todo.isComplete" (change)="updateTodoStatus(todo)">
              <span [class.strike-through]="todo.isComplete">{{ todo.title }}</span>
            </mat-checkbox>
          </div>
          <button mat-icon-button color="warn" (click)="deleteTodo(todo.id)">
            <mat-icon>delete</mat-icon>
          </button>
          <div class="cdk-drag-handle" cdkDragHandle>
            <mat-icon>drag_indicator</mat-icon>
          </div>
        </mat-card>
      </div>
    </mat-card-content>
  </mat-card>
</div>
```

### 5.3 Update `app.component.scss`

Add some basic styling to make the app look presentable.

```css
/* src/app/app.component.scss */
.container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.todo-input-card {
  margin-bottom: 20px;
}

.full-width-input {
  width: calc(100% - 100px); /* Adjust based on button width */
  margin-right: 10px;
}

.todo-list-card {
  margin-top: 20px;
}

.todo-list {
  min-height: 60px;
  background: white;
  border-radius: 4px;
  overflow: hidden;
  display: block;
}

.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #eee;
  background: #fff;
  box-sizing: border-box;
  cursor: move; /* Indicate draggable */
  position: relative;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-item.completed {
  background-color: #f0f0f0;
}

.todo-item .todo-content {
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.todo-item .mat-checkbox {
  margin-right: 10px;
}

.todo-item .strike-through {
  text-decoration: line-through;
  color: #888;
}

.no-todos-message {
  padding: 20px;
  text-align: center;
  color: #888;
}

/* Drag and Drop styles */
.cdk-drag-preview {
  box-sizing: border-box;
  border-radius: 4px;
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
              0 8px 10px 1px rgba(0, 0, 0, 0.14),
              0 3px 14px 2px rgba(0, 0, 0, 0.12);
}

.cdk-drag-placeholder {
  opacity: 0;
}

.cdk-drag-animating {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.todo-list.cdk-drop-list-dragging .todo-item:not(.cdk-drag-placeholder) {
  transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
}

.cdk-drag-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 24px; /* Width of the drag handle area */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: #ccc;
}

.todo-item .mat-checkbox {
  margin-left: 30px; /* Adjust for drag handle */
}


## Step 6: Run the Angular Application

First, ensure your C# backend API is running (from `C# TUTORIAL.md`, Step 2 or 6).

```bash
# In your TodoApiSolution directory
cd TodoApi.Api
dotnet run
```

Then, in your `angular-todo-app` directory:

```bash
ng serve --open
```

This command compiles the application and starts a development server. The `--open` flag automatically opens your browser to `http://localhost:4200/` (the default Angular development server port).

You should now see your Angular To-Do application. You can add new To-Do items, mark them as complete, delete them, and drag them to reorder them. All changes will be persisted to your C# backend API.

Congratulations! You have successfully built an Angular front-end integrated with a C# backend, utilizing Angular Material for UI and Angular CDK for drag-and-drop functionality.
