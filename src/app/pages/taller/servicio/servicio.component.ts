import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
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
import { CarServiceService } from '../../service/car-service.service';
import { Servicio } from '../../model/servicio.model';

@Component({
    selector: 'app-servicio',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, PanelModule, TableModule, InputNumberModule, DialogModule, ToastModule, ConfirmDialogModule, TagModule, CurrencyPipe],
    providers: [MessageService, ConfirmationService],
    templateUrl: './servicio.component.html',
    styleUrl: './servicio.component.scss'
})
export class ServicioComponent implements OnInit {
    @ViewChild('dt') dt: Table | undefined;
    @ViewChild('servicioForm') servicioForm: any;
    @ViewChild('editServicioForm') editServicioForm: any;

    servicios: Servicio[] = [];
    servicio: Partial<Servicio> = {};
    editingServicio: Servicio = {} as Servicio;
    servicioDialog: boolean = false;
    loading: boolean = true;
    inactiveServicios: Servicio[] = [];
    showInactiveDialog: boolean = false;

    constructor(
        private carServiceService: CarServiceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.loadServicios();
    }

    loadServicios() {
        this.loading = true;
        this.carServiceService.mostrar().subscribe({
            next: (data) => {
                this.servicios = data;
                this.loading = false;
                // this.servicios = this.servicios.filter(servicio => servicio.estado !== false);
                console.log('Servicios cargados:', this.servicios);
                // Ordenar servicios por ID
                this.servicios.sort((a, b) => (a.id || 0) - (b.id || 0));
            },
            error: (error) => {
                console.error('Error al cargar servicios:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los servicios'
                });
                this.loading = false;
            }
        });
    }

    saveServicio() {
        const servicioToSave = { ...this.servicio, estado: true } as Servicio;
        this.carServiceService.guardar(servicioToSave).subscribe({
            next: (response) => {
                if (response.message === 'success') {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Servicio guardado correctamente'
                    });
                    this.loadServicios();
                    this.resetForm();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al guardar el servicio'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al guardar el servicio'
                });
            }
        });
    }

    editServicio(servicio: Servicio) {
        this.editingServicio = { ...servicio };
        this.servicioDialog = true;
    }

    updateServicio() {
        this.carServiceService.editar(this.editingServicio.id!, this.editingServicio).subscribe({
            next: (response) => {
                if (response.message === 'success') {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Servicio actualizado correctamente'
                    });
                    this.loadServicios();
                    this.servicioDialog = false;
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al actualizar el servicio'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar el servicio'
                });
            }
        });
    }

    confirmDeleteServicio(servicio: Servicio) {
        this.confirmationService.confirm({
            message: '¿Está seguro que desea eliminar este servicio?',
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.deleteServicio(servicio);
            }
        });
    }

    deleteServicio(servicio: Servicio) {
        this.carServiceService.eliminar(servicio.id!).subscribe({
            next: (response) => {
                if (response.message === 'success') {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Servicio eliminado correctamente'
                    });
                    this.loadServicios();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al eliminar el servicio'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar el servicio'
                });
            }
        });
    }

    switchStatusService(servicio: Servicio) {
        const servicioToUpdate = { ...servicio, estado: !servicio.estado };
        
        this.carServiceService.editar(servicioToUpdate.id!, servicioToUpdate).subscribe({
            next: (response) => {
                if (response.message === 'success') {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: `Servicio ${servicio.estado ? 'desactivado' : 'activado'} correctamente`
                    });
                    this.loadServicios();
                } else {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al cambiar el estado del servicio'
                    });
                }
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cambiar el estado del servicio'
                });
            }
        });
    }

    resetForm() {
        this.servicio = {};
        if (this.servicioForm) {
            this.servicioForm.reset();
        }
    }

    applyFilterGlobal($event: any, stringVal: string) {
        this.dt!.filterGlobal(($event.target as HTMLInputElement).value, stringVal);
    }

    getSeverity(estado: boolean | undefined): 'success' | 'danger' | 'warn' | 'info' | 'secondary' | 'contrast' {
        return estado ? 'success' : 'danger';
    }
}
