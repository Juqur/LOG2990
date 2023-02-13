import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigurationComponent } from '@app/pages/configuration/configuration.component';
import { CreationComponent } from '@app/pages/creation/creation.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game/:id', component: GamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'selection', component: SelectionPageComponent },
    { path: 'config', component: ConfigurationComponent },
    { path: 'creation', component: CreationComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
