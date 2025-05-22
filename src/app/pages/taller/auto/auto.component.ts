import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

import { AutoService, Auto } from '../../service/auto.service';

@Component({
  selector: 'app-auto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    PanelModule,
    TableModule,
    InputNumberModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './auto.component.html',
  styleUrl: './auto.component.scss'
})
export class AutoComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;

  autos: Auto[] = [];
  auto: Partial<Auto> = {};
  editingAuto: Auto = {} as Auto;
  autoDialog: boolean = false;
  loading: boolean = true;

  constructor(
    private autoService: AutoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadAutos();
  }

  loadAutos() {
    this.loading = true;
    this.autoService.getMostrar().subscribe({
      next: (data) => {
        this.autos = data;
        this.loading = false;
        console.log('Autos traidos del back:', data);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los autos'
        });
        this.loading = false;
      }
    });
  }

  saveAuto() {
    this.autoService.guardar(this.auto as Auto).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Auto guardado correctamente'
        });
        this.loadAutos();
        this.auto = {};
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al guardar el auto'
        });
      }
    });
  }

  editAuto(auto: Auto) {
    this.editingAuto = { ...auto };
    this.autoDialog = true;
  }

  saveEditedAuto() {
    if (this.editingAuto.id) {
      this.autoService.editar(this.editingAuto.id, this.editingAuto).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Auto actualizado correctamente'
          });
          this.loadAutos();
          this.hideDialog();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el auto'
          });
        }
      });
    }
  }

  deleteAuto(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar este auto?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.autoService.eliminar(id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Auto eliminado correctamente'
            });
            this.loadAutos();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el auto'
            });
          }
        });
      }
    });
  }

  hideDialog() {
    this.autoDialog = false;
    this.editingAuto = {} as Auto;
  }

  clear(table: Table) {
    table.clear();
  }

  onSearch(event: Event): void {
    if (this.dt) {
      this.dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
  }
}
