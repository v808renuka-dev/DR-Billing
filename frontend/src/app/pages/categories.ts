import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { errMsg } from '../core/auth';
import { Category } from '../core/models';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-head">
      <div><h1>Product Categories</h1><p>Group your products</p></div>
      <button class="btn" (click)="open()">+ Add Category</button>
    </div>
    @if (error() && !form()) { <div class="alert">{{ error() }}</div> }
    <div class="card table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Description</th><th>Products</th><th></th></tr></thead>
        <tbody>
          @for (c of items(); track c.id) {
            <tr><td><b>{{ c.name }}</b></td><td>{{ c.description }}</td><td><span class="badge">{{ c.product_count }}</span></td>
              <td><div class="actions">
                <button class="btn ghost sm" (click)="open(c)">Edit</button>
                <button class="btn danger sm" (click)="remove(c)">Delete</button></div></td></tr>
          } @empty { <tr><td colspan="4" class="empty">No categories yet</td></tr> }
        </tbody>
      </table>
    </div>

    @if (form(); as f) {
      <div class="modal-back" (click)="form.set(null)">
        <form class="modal" (click)="$event.stopPropagation()" (ngSubmit)="save()">
          <h2>{{ f.id ? 'Edit' : 'Add' }} Category</h2>
          @if (error()) { <div class="alert">{{ error() }}</div> }
          <div class="field"><label>Name *</label><input name="n" [(ngModel)]="f.name" required /></div>
          <div class="field"><label>Description</label><textarea name="d" rows="2" [(ngModel)]="f.description"></textarea></div>
          <div class="modal-actions">
            <button type="button" class="btn ghost" (click)="form.set(null)">Cancel</button>
            <button class="btn">Save</button>
          </div>
        </form>
      </div>
    }
  `,
})
export class CategoriesComponent {
  private api = inject(ApiService);
  items = signal<Category[]>([]);
  form = signal<Partial<Category> | null>(null);
  error = signal('');

  constructor() { this.load(); }
  load() { this.api.categories().subscribe(r => this.items.set(r)); }
  open(c?: Category) { this.error.set(''); this.form.set(c ? { ...c } : { name: '', description: '' }); }
  save() {
    this.api.saveCategory(this.form()!).subscribe({
      next: () => { this.form.set(null); this.load(); },
      error: e => this.error.set(errMsg(e)),
    });
  }
  remove(c: Category) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    this.error.set('');
    this.api.deleteCategory(c.id).subscribe({ next: () => this.load(), error: e => this.error.set(errMsg(e)) });
  }
}
