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
import { CalendarModule } from 'primeng/calendar';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';

import { OrdenService, OrdenTrabajo, DetalleOrdenTrabajo } from '../../service/orden.service';
import { ClienteService } from '../../service/cliente.service';
import { AutoService } from '../../service/auto.service';
import { TecnicoService } from '../../service/tecnico.service';
import { CarServiceService } from '../../service/car-service.service';
import { DatePicker, DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-orden',
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
    DropdownModule,
    TagModule,
    CalendarModule,
    DatePickerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './orden.component.html',
  styleUrl: './orden.component.scss'
})
export class OrdenComponent implements OnInit {
  @ViewChild('dt') dt: Table | undefined;
  @ViewChild('ordenForm') ordenForm: any;
  @ViewChild('editOrdenForm') editOrdenForm: any;

  // Datos principales
  ordenes: OrdenTrabajo[] = [];
  orden: OrdenTrabajo = {
    cliente: null,
    auto: null,
    tecnico: null,
    fecha_inicio: new Date().toISOString().substring(0, 10),
    fecha_fin_estimada: '',
    habilitado: true,
    detalle: []
  };
  editingOrden: OrdenTrabajo = {} as OrdenTrabajo;

  // Opciones para dropdowns
  clienteOptions: any[] = [];
  autoOptions: any[] = [];
  filteredAutoOptions: any[] = []; // Lista filtrada por cliente
  tecnicoOptions: any[] = [];
  servicioOptions: any[] = [];

  // Lista completa de autos para filtrado
  allAutos: any[] = [];

  // Detalle de orden
  detalleActual: DetalleOrdenTrabajo = {
    servicio: null,
    minutos: 0,
    costo: 0,
    observaciones: ''
  };
  
  // Estados UI
  loading: boolean = true;
  ordenDialog: boolean = false;
  detalleDialog: boolean = false;
  showInactiveDialog: boolean = false;
  crearOrdenDialog: boolean = false;
  ordenesInactivas: OrdenTrabajo[] = [];
  
  // Paginación
  totalRecords: number = 0;
  currentPage: number = 0;
  pageSize: number = 10;
  
  // Búsqueda
  nombreBusqueda: string = '';
  fechaInferior: Date | null = null;
  fechaSuperior: Date | null = null;
  
  // Para la validación de fechas
  today: Date = new Date();

  constructor(
    private ordenService: OrdenService,
    private clienteService: ClienteService,
    private autoService: AutoService,
    private tecnicoService: TecnicoService,
    private servicioService: CarServiceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    // Implementar método de validación de rango de fechas
    this.orden.validarRangoFechas = this.validarRangoFechas.bind(this.orden);
    this.editingOrden.validarRangoFechas = this.validarRangoFechas.bind(this.editingOrden);
  }

  ngOnInit() {
    this.loadOrdenes();
    this.loadClientes();
    this.loadTecnicos();
    this.loadAutos();
    this.loadServicios();
    this.getTotalRecords();
  }

  validarRangoFechas(): boolean {
    let startDate: string | undefined;
    let endDate: string | undefined;
    
    // Get the correct property based on which naming convention is used
    if ('fechaInicio' in this) {
      startDate = (this as any).fechaInicio;
    } else if ('fecha_inicio' in this) {
      startDate = (this as any).fecha_inicio;
    }
    
    if ('fechaFin' in this) {
      endDate = (this as any).fechaFin;
    } else if ('fecha_fin_estimada' in this) {
      endDate = (this as any).fecha_fin_estimada;
    }
    
    // Check if we have valid dates
    if (!startDate || !endDate) {
      return false;
    }
    
    // Convert to Date objects for comparison
    const inicio = new Date(startDate);
    const fin = new Date(endDate);
    
    // Check if the end date is after the start date
    return fin > inicio;
  }

  loadOrdenes() {
    this.loading = true;
    // Ensure pagination parameters are properly set
    // Make sure the page index is valid (matches backend expectation)
    const page = typeof this.currentPage === 'number' ? this.currentPage : 0;
    const size = this.pageSize || 10;
    
    console.log(`Loading orders with page=${page}, size=${size}`);
    
    this.ordenService.findPaginado(page, size).subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.ordenes = data;
          console.log('Ordenes loaded:', this.ordenes.length);
        } else {
          console.log('No orders found for this page, trying page 0');
          // If no results and we're not on page 0, reset to first page
          if (page > 0) {
            this.currentPage = 0;
            this.loading = false;
            this.loadOrdenes();
            return;
          }
        }
        this.loading = false;
        
        // Also refresh total records count to ensure pagination info is current
        this.getTotalRecords();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las órdenes de trabajo'
        });
        this.loading = false;
        console.error('Error loading ordenes:', error);
      }
    });
  }

  loadOrdenesInactivas() {
    this.ordenService.findAll().subscribe({
      next: (data) => {
        this.ordenesInactivas = data.filter(orden => !orden.habilitado);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar las órdenes inactivas'
        });
        console.error('Error loading inactive ordenes', error);
      }
    });
  }

  loadClientes() {
    this.clienteService.mostrarHabilitados().subscribe({
      next: (clientes) => {
        this.clienteOptions = clientes.map(cliente => ({
          label: `${cliente.nombre} (DNI: ${cliente.dni})`,
          value: cliente
        }));
      },
      error: (error) => {
        console.error('Error loading clientes', error);
      }
    });
  }
  loadAutos() {
    this.autoService.getMostrarHabilitados().subscribe({
      next: (autos) => {
        // Transformar los autos en opciones para el dropdown
        const mappedOptions = autos.map(auto => ({
          label: `${auto.patente} - ${auto.modelo.marca.nombre} ${auto.modelo.nombre}`,
          value: auto
        }));
        
        // Guardar las opciones de autos
        this.autoOptions = [...mappedOptions];
        // Inicializar también las opciones filtradas con todas las opciones
        this.filteredAutoOptions = [...mappedOptions];
      },
      error: (error) => {
        console.error('Error loading autos', error);
      }
    });
  }

  loadTecnicos() {
    this.tecnicoService.mostrarHabilitados().subscribe({
      next: (tecnicos) => {
        this.tecnicoOptions = tecnicos.map(tecnico => ({
          label: `${tecnico.nombre} (DNI: ${tecnico.dni})`,
          value: tecnico
        }));
      },
      error: (error) => {
        console.error('Error loading tecnicos', error);
      }
    });
  }

  loadServicios() {
    this.servicioService.mostrar().subscribe({
      next: (servicios) => {
        this.servicioOptions = servicios
          .filter(servicio => servicio.estado) // Solo servicios habilitados
          .map(servicio => ({
            label: `${servicio.nombre} ($${servicio.precio})`,
            value: servicio
          }));
      },
      error: (error) => {
        console.error('Error loading servicios', error);
      }
    });
  }

  getTotalRecords() {
    this.ordenService.longitud().subscribe({
      next: (total) => {
        this.totalRecords = total;
        console.log('Total records:', total);
      },
      error: (error) => {
        console.error('Error getting total records:', error);
      }
    });
  }

  // Método para agregar un detalle a la orden actual
  addDetalle() {
    if (!this.detalleActual.servicio) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar un servicio'
      });
      return;
    }

    // Si no se especificaron minutos, usar los minutos estimados del servicio
    if (!this.detalleActual.minutos) {
      this.detalleActual.minutos = this.detalleActual.servicio.minutosestimados;
    }
    
    // Si no se especificó costo, usar el precio del servicio
    if (!this.detalleActual.costo) {
      this.detalleActual.costo = this.detalleActual.servicio.precio;
    }

    // // Validar que haya valores válidos para minutos y costo
    // if (!this.detalleActual.minutos || this.detalleActual.minutos <= 0) {
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: 'Error',
    //     detail: 'Los minutos deben ser mayores a 0'
    //   });
    //   return;
    // }

    // if (!this.detalleActual.costo || this.detalleActual.costo <= 0) {
    //   this.messageService.add({
    //     severity: 'error',
    //     summary: 'Error',
    //     detail: 'El costo debe ser mayor a 0'
    //   });
    //   return;
    // }

    // Añadir el detalle a la orden
    this.orden.detalle = this.orden.detalle || [];
    this.orden.detalle.push({...this.detalleActual});
    
    // Calcular el total de la orden
    this.calcularTotal();
    
    // Cerrar diálogo y resetear el detalle actual
    this.detalleDialog = false;
    this.resetDetalleActual();

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Servicio agregado'
    });
  }

  // Método para editar un detalle existente
  editDetalle(detalle: DetalleOrdenTrabajo, index: number) {
    this.detalleActual = {...detalle};
    this.detalleDialog = true;
    
    // Guardar el índice para actualizarlo al guardar
    (this.detalleActual as any).editIndex = index;
  }

  // Método para guardar cambios en un detalle
  saveEditedDetalle() {
    const index = (this.detalleActual as any).editIndex;
    
    if (index !== undefined && this.orden.detalle && this.orden.detalle[index]) {
      // Actualizar el detalle en el array
      this.orden.detalle[index] = {...this.detalleActual};
      delete (this.orden.detalle[index] as any).editIndex;
      
      // Recalcular el total
      this.calcularTotal();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Servicio actualizado'
      });
    }
    
    this.detalleDialog = false;
    this.resetDetalleActual();
  }

  // Método para eliminar un detalle
  removeDetalle(index: number) {
    if (this.orden.detalle) {
      this.orden.detalle.splice(index, 1);
      this.calcularTotal();
    }
  }

  // Método para resetear el detalle actual
  resetDetalleActual() {
    this.detalleActual = {
      servicio: null,
      minutos: 0,
      costo: 0,
      observaciones: ''
    };
  }

  // Método para calcular el total de la orden
  calcularTotal() {
    if (this.orden.detalle && this.orden.detalle.length > 0) {
      this.orden.total = this.orden.detalle.reduce((sum, detalle) => sum + (detalle.costo || 0), 0);
    } else {
      this.orden.total = 0;
    }
  }

  // Método para guardar una orden
  saveOrden() {
    if (!this.orden.cliente || !this.orden.auto || !this.orden.tecnico) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe completar todos los campos requeridos'
      });
      return;
    }

    if (!this.orden.fecha_inicio || !this.orden.fecha_fin_estimada) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar las fechas de inicio y fin estimada'
      });
      return;
    }

    // Validar rango de fechas
    if (this.orden.validarRangoFechas && !this.orden.validarRangoFechas()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La fecha de fin debe ser posterior a la fecha de inicio'
      });
      return;
    }

    // Verificar que tenga al menos un detalle
    if (!this.orden.detalle || this.orden.detalle.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe agregar al menos un servicio'
      });
      return;
    }

    this.loading = true;
    
    // Map frontend field names to Java field names
    const ordenToSave = {
      ...this.orden,
      fechaInicio: this.orden.fecha_inicio,
      fechaFin: this.orden.fecha_fin_estimada
    };
    
    this.ordenService.save(ordenToSave).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Orden guardada correctamente'
        });
        
        this.loading = false;
        this.loadOrdenes();
        this.resetOrden();
        this.crearOrdenDialog = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al guardar la orden'
        });
        console.error('Error saving orden', error);
        this.loading = false;
      }
    });
  }
  // Método para editar una orden existente
  editOrden(orden: OrdenTrabajo) {
    // Hacer una copia profunda de la orden
    this.editingOrden = JSON.parse(JSON.stringify(orden));
    
    // Si la orden tiene un cliente, filtrar los autos por ese cliente
    if (orden.cliente) {
      this.filteredAutoOptions = this.autoOptions.filter(
        autoOption => autoOption.value.cliente?.id === orden.cliente?.id
      );
    } else {
      // Si no tiene cliente, mostrar todos los autos
      this.filteredAutoOptions = [...this.autoOptions];
    }
    
    // Cargar los detalles
    if (orden.id) {
      this.ordenService.buscarDetallesPorOrden(orden.id).subscribe({
        next: (detalles) => {
          this.editingOrden.detalle = detalles;
          this.ordenDialog = true;
        },
        error: (error) => {
          console.error('Error loading detalles', error);
          // Abrir el diálogo incluso si fallan los detalles
          this.ordenDialog = true;
        }
      });
    } else {
      this.ordenDialog = true;
    }
  }

  // Método para guardar una orden editada
  saveEditedOrden() {
    if (!this.editingOrden.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'ID de orden no válido'
      });
      return;
    }

    // Validar rango de fechas
    if (this.editingOrden.validarRangoFechas && !this.editingOrden.validarRangoFechas()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Rango de fechas inválido'
      });
      return;
    }

    this.loading = true;
    const id = this.editingOrden.id;
    
    // Map frontend field names to Java field names
    const ordenToUpdate = {
      ...this.editingOrden,
      fechaInicio: this.editingOrden.fecha_inicio,
      fechaFin: this.editingOrden.fecha_fin_estimada
    };
    
    this.ordenService.actualizar(id, ordenToUpdate).subscribe({
      next: () => {
        // Actualizar los detalles de la orden
        if (this.editingOrden.detalle && this.editingOrden.detalle.length > 0) {
          this.editingOrden.detalle.forEach(detalle => {
            this.ordenService.setOrdenId(id, detalle.id || 0).subscribe();
          });
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Orden actualizada correctamente'
        });
        
        this.ordenDialog = false;
        this.loading = false;
        this.loadOrdenes();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error && error.error.message ? error.error.message : 'Error al actualizar la orden'
        });
        console.error('Error updating orden', error);
        this.loading = false;
      }
    });
  }

  // Método para eliminar (deshabilitar) una orden
  eliminarOrden(id: number) {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar esta orden?',
      accept: () => {
        this.ordenService.eliminar(id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Orden eliminada correctamente'
            });
            this.loadOrdenes();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al eliminar orden'
            });
            console.error('Error deleting orden', error);
          }
        });
      }
    });
  }

  // Método para restaurar una orden eliminada
  restaurarOrden(id: number) {
    // Encontrar la orden en la lista de inactivas
    const orden = this.ordenesInactivas.find(o => o.id === id);
    
    if (orden) {
      // Cambiar el estado y actualizar
      orden.habilitado = true;
      
      this.ordenService.actualizar(id, orden).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Orden restaurada correctamente'
          });
          this.loadOrdenes();
          this.loadOrdenesInactivas();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al restaurar orden'
          });
          console.error('Error restoring orden', error);
        }
      });
    }
  }

  // Método para buscar órdenes
  buscarOrdenes() {
    const nombreBusqueda = this.nombreBusqueda || '';
    const fechaInf = this.fechaInferior ? this.fechaInferior.toISOString().split('T')[0] : '';
    const fechaSup = this.fechaSuperior ? this.fechaSuperior.toISOString().split('T')[0] : '';

    this.ordenService.buscarPorAtributo(nombreBusqueda, fechaInf, fechaSup).subscribe({
      next: (data) => {
        this.ordenes = data;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al buscar órdenes'
        });
        console.error('Error searching ordenes', error);
      }
    });
  }

  // Método para limpiar búsqueda
  clear(table: Table) {
    this.nombreBusqueda = '';
    this.fechaInferior = null;
    this.fechaSuperior = null;
    table.clear();
    this.loadOrdenes();
  }

  // Método para ver las órdenes inactivas
  onShowInactiveDialog() {
    this.loadOrdenesInactivas();
    this.showInactiveDialog = true;
  }

  // Método para abrir diálogo de nuevo detalle
  openNewDetalle() {
    this.resetDetalleActual();
    this.detalleDialog = true;
  }
  // Método para reiniciar el formulario de orden
  resetOrden() {
    this.orden = {
      cliente: null,
      auto: null,
      tecnico: null,
      fecha_inicio: new Date().toISOString().substring(0, 10),
      fecha_fin_estimada: '',
      habilitado: true,
      detalle: []
    };
    this.orden.validarRangoFechas = this.validarRangoFechas.bind(this.orden);
    
    // Restaurar todas las opciones de autos al resetear
    this.filteredAutoOptions = [...this.autoOptions];
  }

  // Método para obtener la clase CSS de severidad según el estado
  getSeverity(habilitado: boolean | undefined): 'success' | 'danger' | 'info' | 'warn' | 'secondary' | 'contrast' {
    return habilitado ? 'success' : 'danger';
  }

  // Método para manejar la paginación
  paginate(event: any) {
    // PrimeNG pagination is 0-based internally but displays as 1-based in UI
    // Make sure we're using the correct zero-based index for the backend
    this.currentPage = event.page;
    this.pageSize = event.rows;
    this.loadOrdenes();
    console.log('Pagination event:', event);
  }

  // Método para cerrar diálogo
  hideDialog() {
    this.ordenDialog = false;
  }
  
  openNewOrden() {
    this.resetOrden();
    this.crearOrdenDialog = true;
  }
  
  hideCrearOrdenDialog() {
    this.crearOrdenDialog = false;
  }

  // Método para calcular la duración total de la orden en horas
  calcularDuracionTotal(orden: OrdenTrabajo): string {
    if (!orden.detalle || orden.detalle.length === 0) {
      return '0 min';
    }
    
    const totalMinutos = orden.detalle.reduce((sum, detalle) => {
      // Check for both minutosRealizados (backend) and minutos (frontend) field names
      const minutos = (detalle as any).minutosRealizados || detalle.minutos || 0;
      return sum + minutos;
    }, 0);
    
    if (totalMinutos < 60) {
      return `${totalMinutos} min`;
    } else {
      const horas = Math.floor(totalMinutos / 60);
      const minutos = totalMinutos % 60;
      return minutos > 0 ? `${horas}h ${minutos}min` : `${horas}h`;
    }
  }

  // Método para formatear fecha
  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      // Handle both ISO format and backend date format
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }
      return date.toLocaleDateString();
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  // Método para verificar si el detalle actual tiene un índice de edición
  hasEditIndex(): boolean {
    return 'editIndex' in this.detalleActual;
  }

  switchStatusOrder(orden: OrdenTrabajo) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${orden.habilitado ? 'deshabilitar' : 'habilitar'} esta orden?`,
      accept: () => {
        orden.habilitado = !orden.habilitado;
        this.ordenService.actualizar(orden.id || 0, orden).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Orden ${orden.habilitado ? 'habilitada' : 'deshabilitada'} correctamente`
            });
            this.loadOrdenes();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Error al ${orden.habilitado ? 'habilitar' : 'deshabilitar'} la orden`
            });
            console.error('Error toggling orden status', error);
          }
        });
      }
    });
  }

  // Método para filtrar autos por cliente
  filterAutosByCliente(clienteId: number | null) {
    if (!clienteId) {
      this.filteredAutoOptions = this.autoOptions;
      return;
    }
    
    // Filtrar la lista de autos según el cliente seleccionado
    this.filteredAutoOptions = this.autoOptions.filter(auto => auto.value.cliente?.id === clienteId);
  }

  // Método para filtrar autos cuando se selecciona un cliente
  onClienteChange(event: any) {
    const selectedCliente = event.value;
    if (!selectedCliente) {
      // Si no hay cliente seleccionado, mostrar todos los autos
      this.filteredAutoOptions = [...this.autoOptions];
      return;
    }
    
    // Filtrar autos por cliente seleccionado
    this.filteredAutoOptions = this.autoOptions.filter(
      autoOption => autoOption.value.cliente?.id === selectedCliente.id
    );
    
    // Limpiar la selección del auto actual
    this.orden.auto = null;
    
    // Mostrar mensaje si no hay autos asociados a este cliente
    if (this.filteredAutoOptions.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: 'Este cliente no tiene autos registrados'
      });
    }
  }
  
  // Método para actualizar el cliente cuando se selecciona un auto
  onAutoChange(event: any) {
    const selectedAuto = event.value;
    if (selectedAuto && selectedAuto.cliente) {
      // Buscar el cliente en las opciones disponibles
      const clienteFound = this.clienteOptions.find(
        opt => opt.value.id === selectedAuto.cliente.id
      );
      
      if (clienteFound) {
        // Actualizar el cliente en la orden
        this.orden.cliente = clienteFound.value;
      }
    }
  }

  // Versiones para la edición de orden
  onClienteChangeEdit(event: any) {
    const selectedCliente = event.value;
    if (!selectedCliente) {
      // Si no hay cliente seleccionado, mostrar todos los autos
      this.filteredAutoOptions = [...this.autoOptions];
      return;
    }
    
    // Filtrar autos por cliente seleccionado
    this.filteredAutoOptions = this.autoOptions.filter(
      autoOption => autoOption.value.cliente?.id === selectedCliente.id
    );
    
    // Limpiar la selección del auto actual
    this.editingOrden.auto = null;
    
    // Mostrar mensaje si no hay autos asociados a este cliente
    if (this.filteredAutoOptions.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Información',
        detail: 'Este cliente no tiene autos registrados'
      });
    }
  }
  
  // Método para actualizar el cliente cuando se selecciona un auto (en edición)
  onAutoChangeEdit(event: any) {
    const selectedAuto = event.value;
    if (selectedAuto && selectedAuto.cliente) {
      // Buscar el cliente en las opciones disponibles
      const clienteFound = this.clienteOptions.find(
        opt => opt.value.id === selectedAuto.cliente.id
      );
      
      if (clienteFound) {
        // Actualizar el cliente en la orden
        this.editingOrden.cliente = clienteFound.value;
      }
    }
  }

  // Método para actualizar minutos y costo cuando se selecciona un servicio
  onServicioChange(event: any) {
    const selectedServicio = event.value;
    if (selectedServicio) {
      // Actualizar los campos de minutos y costo con los valores del servicio seleccionado
      this.detalleActual.minutos = selectedServicio.minutosestimados;
      this.detalleActual.costo = selectedServicio.precio;
    } else {
      // Si no hay servicio seleccionado, reiniciar los valores
      this.detalleActual.minutos = 0;
      this.detalleActual.costo = 0;
    }
  }
}
