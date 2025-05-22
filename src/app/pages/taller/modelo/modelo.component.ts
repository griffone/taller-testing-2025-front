import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { ModeloService } from '../../service/modelo.service';
import { MarcaService } from '../../service/marca.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';

interface Modelo {
    id: number;
    nombre: string;
    estado: boolean;
    marca: any;
}

interface Marca {
    id: number;
    nombre: string;
    estado: boolean;
}

@Component({
    selector: 'app-modelo',
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
    templateUrl: './modelo.component.html',
    styleUrl: './modelo.component.scss'
})
export class ModeloComponent implements OnInit {
    modelos: Modelo[] = [];
    newModelo: Partial<Modelo> = {};
    estadoOptions: any[] = [];
    marcaOptions: any[] = [];
    totalRecords: number = 0;
    currentPage: number = 0;
    pageSize: number = 10;
    showInactiveDialog: boolean = false;
    inactiveModelos: Modelo[] = [];
    showEditDialog: boolean = false;
    selectedModelo: any = {};

    constructor(
        private modeloService: ModeloService,
        private marcaService: MarcaService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}    ngOnInit(): void {
        this.loadModelos();
        this.getTotalRecords();
        this.loadMarcas();
    }

    loadMarcas(): void {
        this.marcaService.mostrarHabilitados().subscribe({
            next: (data) => {
                this.marcaOptions = data.map(marca => ({
                    label: marca.nombre,
                    value: marca
                }));
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

    loadModelos(): void {
        this.modeloService.mostrarPaginado(this.currentPage, this.pageSize).subscribe({
            next: (data) => {
                this.modelos = data;
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los modelos'
                });
                console.error('Error loading modelos', err);
            }
        });
    }

    loadInactiveModelos(): void {
        this.modeloService.mostrar().subscribe({
            next: (data) => {
                this.inactiveModelos = data.filter(modelo => modelo.estado === false);
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar los modelos inactivos'
                });
                console.error('Error loading inactive modelos', err);
            }
        });
    }

    getTotalRecords(): void {
        this.modeloService.longitud().subscribe({
            next: (count) => {
                this.totalRecords = count;
            },
            error: (err) => {
                console.error('Error getting total records', err);
            }
        });
    }    addModelo(): void {
        if (this.newModelo.nombre && this.newModelo.marca) {
            const newModeloToSave = {
                ...this.newModelo,
                estado: true  // Always set as active
            };
            this.modeloService.guardar(newModeloToSave).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Modelo agregado correctamente'
                    });
                    this.loadModelos();
                    this.getTotalRecords();
                    this.newModelo = {};
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al agregar modelo'
                    });
                    console.error('Error adding modelo', err);
                }
            });
        }
    }    editModelo(modelo: Modelo): void {
        this.selectedModelo = { 
            ...modelo,
            marca: this.marcaOptions.find(m => m.value.id === modelo.marca.id)?.value
        };
        this.showEditDialog = true;
    }    onEditModeloSubmit(): void {
        const updatedModelo = {
            ...this.selectedModelo,
            estado: true  // Always set as active
        };

        this.modeloService.actualizar(this.selectedModelo.id, updatedModelo).subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Modelo actualizado correctamente'
                });
                this.showEditDialog = false;
                this.loadModelos();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar el modelo'
                });
                console.error('Error updating modelo', err);
            }
        });
    }

    deleteModelo(id: number): void {
        this.confirmationService.confirm({
            message: '¿Está seguro que desea eliminar este modelo?',
            accept: () => {
                this.modeloService.eliminar(id).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Éxito',
                            detail: 'Modelo eliminado correctamente'
                        });
                        this.loadModelos();
                        this.getTotalRecords();
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Error al eliminar modelo'
                        });
                        console.error('Error deleting modelo', err);
                    }
                });
            }
        });
    }

    restoreModelo(id: number): void {
        const modeloToRestore = this.inactiveModelos.find(modelo => modelo.id === id);
        if (modeloToRestore) {
            const updatedModelo = { ...modeloToRestore, estado: true };
            this.modeloService.actualizar(id, updatedModelo).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Éxito',
                        detail: 'Modelo restaurado correctamente'
                    });
                    this.loadModelos();
                    this.loadInactiveModelos();
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Error al restaurar el modelo'
                    });
                    console.error('Error restoring modelo', err);
                }
            });
        }
    }

    paginate(event: any): void {
        this.currentPage = event.page;
        this.loadModelos();
    }

    onShowInactiveDialog(): void {
        this.showInactiveDialog = true;
        this.loadInactiveModelos();
    }
}
