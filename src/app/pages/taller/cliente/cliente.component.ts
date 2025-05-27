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

import { ClienteService } from '../../../pages/service/cliente.service';
import { Cliente } from '../../../pages/model/cliente.model';

@Component({
  selector: 'app-cliente',
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
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.scss'
})
export class ClienteComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;
  clientes: Cliente[] = [];
  cliente: Partial<Cliente> = {};
  editingCliente: Cliente = {} as Cliente;
  clienteDialog: boolean = false;
  loading: boolean = true;
  inactiveClientes: Cliente[] = [];
  showInactiveDialog: boolean = false;

  constructor(
    private clienteService: ClienteService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.loadClientes();
  }

  loadClientes() {
    this.loading = true;
    this.clienteService.mostrar().subscribe({
      next: (data) => {
        this.clientes = data;
        this.loading = false;
        // Ordenar data por nombre
        // this.clientes.sort((a, b) => a.nombre.localeCompare(b.nombre));
        // Descartar clientes con estado false
        this.clientes = this.clientes.filter(cliente => cliente.estado !== false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los clientes'
        });
        this.loading = false;
      }
    });
  }

  saveCliente() {
    const clienteToSave = { ...this.cliente, estado: true } as Cliente;
    this.clienteService.guardar(clienteToSave).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cliente guardado correctamente'
        });
        this.loadClientes();
        this.cliente = {};
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al guardar el cliente'
        });
      }
    });
  }

  editCliente(cliente: Cliente) {
    this.editingCliente = {...cliente};
    this.clienteDialog = true;
  }

  saveEditedCliente() {
    if (this.editingCliente.id) {
      this.clienteService.actualizar(this.editingCliente.id, this.editingCliente).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente actualizado correctamente'
          });
          this.loadClientes();
          this.hideDialog();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el cliente'
          });
        }
      });
    }
  }

  deleteCliente(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar este cliente?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.clienteService.eliminar(id).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cliente eliminado correctamente'
            });
            this.loadClientes();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar el cliente'
            });
          }
        });
      }
    });
  }

  hideDialog() {
    this.clienteDialog = false;
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value.trim().length > 0) {
      this.clienteService.buscarPorAtributo(value).subscribe({
        next: (data) => {
          this.clientes = data;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al buscar clientes'
          });
        }
      });
    } else {
      this.loadClientes();
    }
  }

  clear(table: Table) {
    if (table) {
      table.clear();
      this.loadClientes();
    }
  }

  loadInactiveClientes() {
    // Assuming there is a method to get inactive clients
    // If not available, this can be removed or modified
    this.clienteService.mostrar().subscribe({
      next: (data) => {
        this.inactiveClientes = data.filter(cliente => !cliente.estado);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar los clientes inactivos'
        });
      }
    });
  }

  onShowInactiveDialog() {
    this.loadInactiveClientes();
    this.showInactiveDialog = true;
  }

  restoreCliente(id: number) {
    // This would need a method in the service to restore a client
    // For now, we'll use the update method to change the estado
    const cliente = this.inactiveClientes.find(c => c.id === id);
    if (cliente) {
      cliente.estado = true;
      this.clienteService.actualizar(id, cliente).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Cliente restaurado correctamente'
          });
          this.loadInactiveClientes();
          this.loadClientes();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al restaurar el cliente'
          });
        }
      });
    }
  }
}
