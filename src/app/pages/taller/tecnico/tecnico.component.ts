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

import { TecnicoService } from '../../service/tecnico.service';
import { Tecnico } from '../../model/tecnico.model';

@Component({
  selector: 'app-tecnico',
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
  templateUrl: './tecnico.component.html',
  styleUrl: './tecnico.component.scss'
})
export class TecnicoComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;
  @ViewChild('tecnicoForm') tecnicoForm: any;
  @ViewChild('editTecnicoForm') editTecnicoForm: any;
  
  tecnicos: Tecnico[] = [];
  tecnico: Tecnico = {
    dni: null,
    nombre: '',
    estado: true
  };
  editingTecnico: Tecnico = {
    dni: null,
    nombre: '',
    estado: true
  };
  tecnicoDialog: boolean = false;
  loading: boolean = true;
  inactiveTecnicos: Tecnico[] = [];
  showInactiveDialog: boolean = false;
  currentPage: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  constructor(
    private tecnicoService: TecnicoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.loadTecnicos();
    this.getTotalRecords();
  }

  loadTecnicos() {
    this.loading = true;
    this.tecnicoService.mostrar().subscribe({
      next: (data) => {
        this.tecnicos = data.filter(tecnico => tecnico.estado !== false);
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los técnicos'
        });
        this.loading = false;
      }
    });
  }

  getTotalRecords() {
    this.tecnicoService.longitud().subscribe({
      next: (count) => {
        this.totalRecords = count;
      },
      error: (error) => {
        console.error('Error getting total records:', error);
      }
    });
  }

  saveTecnico() {
    this.tecnico.estado = true;
    
    this.tecnicoService.guardar(this.tecnico).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Técnico guardado correctamente'
        });
        this.loadTecnicos();
        this.tecnico = {
          dni: null,
          nombre: '',
          estado: true
        };
      },
      error: (error) => {
        let errorMsg = 'Error al guardar el técnico';
        if (error.error && error.error.message) {
          errorMsg = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          errorMsg = error.error;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMsg
        });
      }
    });
  }

  editTecnico(tecnico: Tecnico) {
    this.editingTecnico = { ...tecnico };
    this.tecnicoDialog = true;
  }

  saveEditedTecnico() {
    this.editingTecnico.estado = true;

    this.tecnicoService.editar(this.editingTecnico.id!, this.editingTecnico).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Técnico actualizado correctamente'
        });
        this.loadTecnicos();
        this.hideDialog();
      },
      error: (error) => {
        let errorMsg = 'Error al actualizar el técnico';
        if (error.error && error.error.message) {
          errorMsg = error.error.message;
        }
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMsg
        });
      }
    });
  }

  deleteTecnico(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar este técnico?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.tecnicoService.eliminar(id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Técnico eliminado correctamente'
            });
            this.loadTecnicos();
          },
          error: (error) => {
            let errorMsg = 'Error al eliminar el técnico';
            if (error.error && error.error.message) {
              errorMsg = error.error.message;
            }
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: errorMsg
            });
          }
        });
      }
    });
  }

  hideDialog() {
    this.tecnicoDialog = false;
    this.editingTecnico = {
      dni: null,
      nombre: '',
      estado: true
    };
  }

  onSearch(event: Event) {
    if (this.dt) {
      this.dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
  }

  clear(table: Table) {
    if (table) {
      table.clear();
      this.loadTecnicos();
    }
  }

  loadInactiveTecnicos() {
    this.tecnicoService.mostrar().subscribe({
      next: (data) => {
        this.inactiveTecnicos = data.filter(tecnico => !tecnico.estado);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los técnicos inactivos'
        });
      }
    });
  }

  onShowInactiveDialog() {
    this.loadInactiveTecnicos();
    this.showInactiveDialog = true;
  }

  restoreTecnico(id: number) {
    const tecnico = this.inactiveTecnicos.find(t => t.id === id);
    if (tecnico) {
      tecnico.estado = true;
      this.tecnicoService.editar(id, tecnico).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Técnico restaurado correctamente'
          });
          this.loadInactiveTecnicos();
          this.loadTecnicos();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al restaurar el técnico'
          });
        }
      });
    }
  }

  paginate(event: any) {
    this.currentPage = event.page;
    this.loadTecnicos();
  }
}
