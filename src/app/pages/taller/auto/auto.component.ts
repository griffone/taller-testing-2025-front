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
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

import { AutoService, Auto } from '../../service/auto.service';
import { MarcaService } from '../../service/marca.service';
import { ModeloService } from '../../service/modelo.service';

@Component({
  selector: 'app-auto',
  standalone: true, imports: [
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
    DropdownModule,
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
  marcaOptions: any[] = [];
  modeloOptions: any[] = [];
  selectedMarca: any = null;

  constructor(
    private autoService: AutoService,
    private marcaService: MarcaService,
    private modeloService: ModeloService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }
  ngOnInit() {
    this.loadAutos();
    this.loadMarcas();
  }

  loadMarcas() {
    this.marcaService.mostrarHabilitados().subscribe({
      next: (marcas) => {
        this.marcaOptions = marcas.map(marca => ({
          label: marca.nombre,
          value: marca
        }));
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las marcas'
        });
        console.error('Error cargando marcas:', error);
      }
    });
  }

  loadModelosByMarca(marcaId: number) {
    this.modeloService.mostrarXMarca(marcaId).subscribe({
      next: (modelos) => {
        this.modeloOptions = modelos.filter(modelo => modelo.estado).map(modelo => ({
          label: modelo.nombre,
          value: modelo
        }));
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los modelos'
        });
        console.error('Error cargando modelos:', error);
      }
    });
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
  } editAuto(auto: Auto) {
    console.log('Auto a editar:', auto);
    // Hacemos una copia profunda del auto para no modificar el original
    this.editingAuto = { ...auto };

    try {
      // Si el auto tiene un modelo con marca, seleccionamos la correcta en las opciones
      if (auto.modelo && typeof auto.modelo === 'object' && auto.modelo.marca) {
        const marcaId = auto.modelo.marca.id;

        // Buscamos la marca en las opciones disponibles
        const marcaOption = this.marcaOptions.find(m => m.value.id === marcaId);
        if (marcaOption) {
          this.selectedMarca = marcaOption.value;

          // Cargamos los modelos correspondientes a esta marca
          this.loadModelosByMarca(marcaId);

          // Una vez que tengamos los modelos, seleccionamos el modelo correcto
          setTimeout(() => {
            if (auto.modelo && typeof auto.modelo === 'object' && auto.modelo.id) {
              const modeloOption = this.modeloOptions.find(m => m.value.id === auto.modelo.id);
              if (modeloOption) {
                this.editingAuto.modelo = modeloOption.value;
              }
            }
          }, 300);
        }
      }
    } catch (error) {
      console.error('Error al preparar el formulario de edición:', error);
    }

    this.autoDialog = true;
  } saveEditedAuto() {
    if (this.editingAuto.id) {
      // Asegurarse de que los datos estén correctamente formateados antes de enviarlos
      const autoToUpdate = {
        ...this.editingAuto,
        // Si el modelo es un objeto del dropdown, usamos su valor
        modelo: typeof this.editingAuto.modelo === 'object' && this.editingAuto.modelo ?
          this.editingAuto.modelo : this.editingAuto.modelo,
        // Aseguramos que se mantenga activo
        estado: true
      };

      console.log('Auto a actualizar:', autoToUpdate);

      this.autoService.editar(this.editingAuto.id, autoToUpdate).subscribe({
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
          console.error('Error actualizando auto:', error);
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
