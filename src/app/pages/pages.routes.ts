import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { AutoComponent } from './taller/auto/auto.component';
import { MarcaComponent } from './taller/marca/marca.component';
import { ModeloComponent } from './taller/modelo/modelo.component';
import { ClienteComponent } from './taller/cliente/cliente.component';
import { TecnicoComponent } from './taller/tecnico/tecnico.component';
import { OrdenComponent } from './taller/orden/orden.component';
import { ServicioComponent } from './taller/servicio/servicio.component';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    /* Custom routes -> Delete above */
    { path: 'auto', component: AutoComponent },
    { path: 'marca', component: MarcaComponent },
    { path: 'modelo', component: ModeloComponent },
    { path: 'cliente', component: ClienteComponent },
    { path: 'tecnico', component: TecnicoComponent },
    { path: 'orden', component: OrdenComponent },
    { path: 'servicio', component: ServicioComponent },
    /* - */
    { path: '**', redirectTo: '/notfound' },
] as Routes;
