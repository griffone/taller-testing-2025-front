import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { MarcaService } from '../../service/marca.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

interface Marca {
    id: number;
    nombre: string;
    estado: string;
}

@Component({
    selector: 'app-marca',
    imports: [
        Panel, 
        FormsModule, 
        TableModule, 
        InputTextModule, 
        ButtonModule, 
        DropdownModule,
        ToastModule,
        ConfirmDialogModule
    ], 
    providers: [MessageService, ConfirmationService],
    templateUrl: './marca.component.html',
    styleUrl: './marca.component.scss'
})
export class MarcaComponent implements OnInit {
    marcas: Marca[] = [];
    newMarca: Partial<Marca> = {};
    estadoOptions: any[] = [];
    totalRecords: number = 0;
    currentPage: number = 0;
    pageSize: number = 10;

    constructor(
        private marcaService: MarcaService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.estadoOptions = [
            { label: 'Activo', value: 'Activo' },
            { label: 'Inactivo', value: 'Inactivo' }
        ];
        this.loadMarcas();
        this.getTotalRecords();
    }

    loadMarcas(): void {
        this.marcaService.mostrarPaginado(this.currentPage, this.pageSize).subscribe({
            next: (data) => {
                this.marcas = data;
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar las marcas'
                });
                console.error('Error loading marcas', err);
            }
        });
    }

    getTotalRecords(): void {
        this.marcaService.longitud().subscribe({
            next: (count) => {
                this.totalRecords = count;
            },
            error: (err) => {
                console.error('Error getting total records', err);
            }
        });
    }

    addMarca(): void {
        if (this.newMarca.nombre && this.newMarca.estado !== undefined) {
            const estadoBoolean = this.newMarca.estado === 'Activo';
            const newMarcaToSave = {
                ...this.newMarca,
                estado: estadoBoolean
            };
            this.marcaService.guardar(newMarcaToSave).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Marca agregada correctamente'
                    });
                    this.loadMarcas();
                    this.getTotalRecords();
                    this.newMarca = {};
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al agregar marca'
                    });
                    console.error('Error adding marca', err);
                }
            });
        }
    }

    editMarca(marca: Marca): void {
        const updatedNombre = prompt('Editar nombre de la marca:', marca.nombre);
        const updatedEstado = prompt('Editar estado de la marca (Activo/Inactivo):', marca.estado ? 'Activo' : 'Inactivo');
        
        if (updatedNombre !== null && updatedEstado !== null && 
            (updatedEstado === 'Activo' || updatedEstado === 'Inactivo')) {
            
            const updatedMarca = {
                ...marca,
                nombre: updatedNombre,
                estado: updatedEstado === 'Activo'
            };
            
            this.marcaService.actualizar(marca.id, updatedMarca).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Marca actualizada correctamente'
                    });
                    this.loadMarcas();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al actualizar marca'
                    });
                    console.error('Error updating marca', err);
                }
            });
        }
    }

    deleteMarca(id: number): void {
        this.confirmationService.confirm({
            message: '¿Está seguro que desea eliminar esta marca?',
            accept: () => {
                this.marcaService.eliminar(id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Marca eliminada correctamente'
                        });
                        this.loadMarcas();
                        this.getTotalRecords();
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al eliminar marca'
                        });
                        console.error('Error deleting marca', err);
                    }
                });
            }
        });
    }

    paginate(event: any): void {
        this.currentPage = event.page;
        this.loadMarcas();
    }
}
