import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CardComponent } from '@app/components/card/card.component';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { CarouselComponent } from './components/carousel/carousel.component';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { CounterComponent } from './components/counter/counter.component';
import { GameChatComponent } from './components/game-chat/game-chat.component';
import { GameTimerComponent } from './components/game-timer/game-timer.component';
import { ImageDifferenceComponent } from './components/image-difference/image-difference.component';
import { MessageBoxComponent } from './components/message-box/message-box.component';
import { ScaleContainerComponent } from './components/scale-container/scale-container.component';
import { ConfigurationComponent } from './pages/configuration/configuration.component';
import { CreationComponent } from './pages/creation/creation.component';
import { PopUpDialogComponent } from './components/pop-up-dialog/pop-up-dialog.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        MaterialPageComponent,
        PlayAreaComponent,
        SidebarComponent,
        SelectionPageComponent,
        CardComponent,
        GameTimerComponent,
        GameChatComponent,
        ImageDifferenceComponent,
        ChatMessageComponent,
        MessageBoxComponent,
        CarouselComponent,
        ConfigurationComponent,
        CreationComponent,
        ScaleContainerComponent,
        CounterComponent,
        PopUpDialogComponent,
    ],
    imports: [AppMaterialModule, AppRoutingModule, BrowserAnimationsModule, BrowserModule, MatSliderModule, FormsModule, HttpClientModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
