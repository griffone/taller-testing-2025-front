import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Modelo para DetalleOrdenTrabajo
export interface DetalleOrdenTrabajo {
  id?: number;
  servicio?: any;
  minutos?: number;
  costo?: number;
  observaciones?: string;
  orden?: OrdenTrabajo;
  
  // Backend fields
  descripcion?: string;
  cantidad?: number;
  minutosRealizados?: number;
  subtotal?: number;
  estado?: boolean;
}

// Modelo para OrdenTrabajo
export interface OrdenTrabajo {
  id?: number;
  cliente?: any;
  auto?: any;
  tecnico?: any;
  
  // Front-end field names
  fecha_inicio?: string;
  fecha_fin_estimada?: string;
  fecha_fin_real?: string;
  
  // Java model field names
  fechaInicio?: string;
  fechaFin?: string;
  
  total?: number;
  habilitado?: boolean;
  detalle?: DetalleOrdenTrabajo[];
  
  estado?: any;
  descripcion?: string;
  
  // Método para validar el rango de fechas (debe implementarse en el componente que usa el modelo)
  validarRangoFechas?(): boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OrdenService {
  private baseUrl = environment.apiUrl+'/ordenTrabajo';
  private detalleUrl = environment.apiUrl+'/detalleOrden';

  constructor(private http: HttpClient) { }

  // Métodos para OrdenTrabajo
  save(orden: OrdenTrabajo): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/guardar`, orden);
  }
  
  getLastId(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getLastId`);
  }
  
  setOrdenId(ordenId: number, detalleId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/setOrdenId/${ordenId}/${detalleId}`, {});
  }
  
  findPaginado(page: number = 0, size: number = 10): Observable<OrdenTrabajo[]> {
    // Ensure page is a number and not negative
    const pageIndex = Math.max(0, page);
    const params = new HttpParams()
      .set('page', pageIndex.toString())
      .set('size', size.toString());
    console.log(`Requesting page ${pageIndex} with size ${size}`);
    return this.http.get<OrdenTrabajo[]>(`${this.baseUrl}/mostrarpaginado`, { params });
  }
  
  findAll(): Observable<OrdenTrabajo[]> {
    return this.http.get<OrdenTrabajo[]>(`${this.baseUrl}/mostrar`);
  }
  
  longitud(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/longitud`);
  }
  
  findHabiliitados(): Observable<OrdenTrabajo[]> {
    return this.http.get<OrdenTrabajo[]>(`${this.baseUrl}/mostrarHabilitados`);
  }
  
  findById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/mostrarPorId/${id}`);
  }

  actualizar(id: number, orden: OrdenTrabajo): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/editar/${id}`, orden);
  }

  eliminar(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/eliminar/${id}`, {});
  }
  
  ultimaOrdenCliente(idCliente: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/mostrar/ultima/${idCliente}`);
  }
  
  buscarPorAtributo(nombre: string, fechaInferior: string, fechaSuperior: string): Observable<OrdenTrabajo[]> {
    return this.http.get<OrdenTrabajo[]>(`${this.baseUrl}/mostrar/${nombre}/${fechaInferior}/${fechaSuperior}`);
  }
  
  // Métodos para DetalleOrdenTrabajo
  buscarDetallesPorOrden(idOrden: number): Observable<DetalleOrdenTrabajo[]> {
    return this.http.get<DetalleOrdenTrabajo[]>(`${this.detalleUrl}/mostrar/${idOrden}`);
  }
}
