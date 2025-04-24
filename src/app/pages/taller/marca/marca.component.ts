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
import { DialogModule } from 'primeng/dialog';

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
        ConfirmDialogModule,
        DialogModule
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
    showInactiveDialog: boolean = false;
    inactiveMarcas: Marca[] = [];
    showEditDialog: boolean = false;
    selectedMarca: any = {};

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

    loadInactiveMarcas(): void {
        this.marcaService.mostrar().subscribe({
            next: (data) => {
                this.inactiveMarcas = data.filter(marca => marca.estado === false);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar las marcas inactivas'
                });
                console.error('Error loading inactive marcas', err);
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
        this.selectedMarca = { ...marca };
        this.showEditDialog = true;
    }

    onEditMarcaSubmit(): void {
        const updatedMarca = {
            ...this.selectedMarca,
            estado: this.selectedMarca.estado === 'Activo'
        };

        this.marcaService.actualizar(this.selectedMarca.id, updatedMarca).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Marca actualizada correctamente'
                });
                this.showEditDialog = false;
                this.loadMarcas();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar la marca'
                });
                console.error('Error updating marca', err);
            }
        });
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

    restoreMarca(id: number): void {
        const marcaToRestore = this.inactiveMarcas.find(marca => marca.id === id);
        if (marcaToRestore) {
            const updatedMarca = { ...marcaToRestore, estado: true };
            this.marcaService.actualizar(id, updatedMarca).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Marca restaurada correctamente'
                    });
                    this.loadMarcas();
                    this.loadInactiveMarcas();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al restaurar la marca'
                    });
                    console.error('Error restoring marca', err);
                }
            });
        }
    }

    paginate(event: any): void {
        this.currentPage = event.page;
        this.loadMarcas();
    }

    onShowInactiveDialog(): void {
        this.showInactiveDialog = true;
        this.loadInactiveMarcas();
    }
}
