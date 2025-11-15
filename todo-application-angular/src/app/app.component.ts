import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TodoService } from './todos/todo.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.Default
})
export class AppComponent {
  protected title = 'todo-application-angular';

  constructor(private todoService: TodoService){ setTimeout(() => {
    this.title = "Titulo 2"
    console.log('aqui')
  }, 2000)}

  public getTitle() {
    return this.title
  }
}
