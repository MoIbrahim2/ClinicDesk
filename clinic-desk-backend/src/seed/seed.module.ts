import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Service } from '../services/entities/service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, User, Service])],
  providers: [SeedService],
})
export class SeedModule {}
