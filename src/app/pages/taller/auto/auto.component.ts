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
    // Guardamos el modelo actual para comparar
    const currentModeloId = this.editingAuto?.modelo?.id;
    
    // Reseteamos el modelo seleccionado solo si fue cambiado manualmente por el usuario
    // Si la marca actual no coincide con la marca del modelo, es un cambio manual
    if (this.editingAuto?.modelo?.marca?.id !== marcaId) {
      this.editingAuto.modelo = null;
    }
    
    console.log('Cargando modelos para la marca ID:', marcaId);
    this.modeloService.mostrarXMarca(marcaId).subscribe({
      next: (modelos) => {
        this.modeloOptions = modelos.filter(modelo => modelo.estado).map(modelo => ({
          label: modelo.nombre,
          value: modelo
        }));
        console.log('Modelos cargados:', this.modeloOptions);
        
        // Si teníamos un modelo seleccionado y coincide con la marca, lo restauramos
        if (currentModeloId) {
          const modeloFound = this.modeloOptions.find(m => m.value.id === currentModeloId);
          if (modeloFound) {
            console.log('Restaurando modelo previo:', modeloFound);
            this.editingAuto.modelo = modeloFound.value;
          }
        }
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
        // Ordenar data por patente
        this.autos.sort((a, b) => a.patente.localeCompare(b.patente));
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
  }  editAuto(auto: Auto) {
    console.log('Auto a editar:', auto);
    // Hacemos una copia profunda del auto para no modificar el original
    this.editingAuto = { ...auto };

    try {
      // Si el auto tiene un modelo con marca
      if (auto.modelo && typeof auto.modelo === 'object' && auto.modelo.marca) {
        const marcaId = auto.modelo.marca.id;
        
        // Buscamos la marca en las opciones disponibles
        const marcaEncontrada = this.marcaOptions.find(m => m.value.id === marcaId);
        if (marcaEncontrada) {
          console.log('Marca encontrada:', marcaEncontrada);
          // Seleccionamos directamente el objeto completo de la opción (que ya tiene la estructura correcta)
          this.selectedMarca = marcaEncontrada.value;
          
          // Cargamos los modelos para esta marca
          this.loadModelosByMarca(marcaId);
          
          // Esperamos a que se carguen los modelos y luego seleccionamos el correcto
          setTimeout(() => {
            if (auto.modelo && auto.modelo.id) {
              const modeloId = auto.modelo.id;
              
              // Buscamos el modelo en las opciones cargadas
              const modeloEncontrado = this.modeloOptions.find(m => m.value.id === modeloId);
              if (modeloEncontrado) {
                console.log('Modelo encontrado:', modeloEncontrado);
                // Seleccionamos el objeto completo (no solo el valor)
                this.editingAuto.modelo = modeloEncontrado.value;
              } else {
                console.warn('No se encontró el modelo con ID:', modeloId, 'en las opciones disponibles');
                // Si no encontramos el modelo, al menos mantener una referencia
                this.editingAuto.modelo = auto.modelo;
              }
            }
          }, 500);
        } else {
          console.warn('No se encontró la marca con ID:', marcaId, 'en las opciones disponibles');
        }
      }
    } catch (error) {
      console.error('Error al preparar el formulario de edición:', error);
    }

    this.autoDialog = true;
  }  saveEditedAuto() {
    if (this.editingAuto.id) {
      // Validamos que tengamos un modelo seleccionado
      if (!this.editingAuto.modelo) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Debe seleccionar un modelo de auto'
        });
        return;
      }
      
      // Asegurarse de que los datos estén correctamente formateados antes de enviarlos
      const autoToUpdate = {
        ...this.editingAuto,
        // Aseguramos que el modelo esté correctamente asignado
        modelo: this.editingAuto.modelo, 
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

  switchStatusAuto(auto: Auto) {
    const newStatus = !auto.estado;
    // Función de editar del servicio
    if (auto.id !== undefined) {
      this.autoService.editar(auto.id, { ...auto, estado: newStatus }).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Auto ${newStatus ? 'habilitado' : 'deshabilitado'} correctamente`
          });
          this.loadAutos();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Error al ${newStatus ? 'habilitar' : 'deshabilitar'} el auto`
          });
        }
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El auto no tiene un ID válido'
      });
    }
  }

  hideDialog() {
    this.autoDialog = false;
    this.editingAuto = {} as Auto;
    this.selectedMarca = null;
    this.modeloOptions = [];
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
