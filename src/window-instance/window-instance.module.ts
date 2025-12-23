import { Module } from '@nestjs/common';
import { WindowInstanceService } from './window-instance.service';

@Module({
  providers: [WindowInstanceService],
  exports: [WindowInstanceService],
})
export class WindowInstanceModule {}
