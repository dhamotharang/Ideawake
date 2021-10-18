import { FileNamePipe, InLineSearchPipe } from '../../pipes';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    // dep modules
  ],
  declarations: [FileNamePipe, InLineSearchPipe],
  exports: [FileNamePipe, InLineSearchPipe]
})
export class ApplicationPipesModule {}
