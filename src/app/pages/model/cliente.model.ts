export interface Cliente {
  id?: number;
  dni: number;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  estado?: boolean;
  fecha_ultima_actualizacion?: string;
  observaciones?: string;
}
