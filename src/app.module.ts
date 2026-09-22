import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/fleet/companies.module';
import { BankDetailsModule } from './modules/fleet/bank-details.module';
import { OwnersModule } from './modules/fleet/owners.module';
import { TrucksModule } from './modules/fleet/trucks.module';
import { DriversModule } from './modules/fleet/drivers.module';
import { AuditLogModule } from './modules/audit-log.module';
import { GstConfigurerModule } from './modules/master/gst-configurer.module';
import { MaterialModule } from './modules/master/material.module';
import { ClientModule } from './modules/master/client.module';
import { ClientBranchModule } from './modules/master/client-branch.module';
import { DealerModule } from './modules/master/dealer.module';
import { TransportRateModule } from './modules/master/transport-rate.module';
import { BunkAssignModule } from './modules/master/bunk-assign.module';
import { AccountAssignModule } from './modules/master/account-assign.module';
import { ActionsModule } from './modules/fleet/actions.module';
import { PincodeModule } from './modules/master/pincode.module';
import { DeliveryChallanModule } from './modules/trip/delivery-challan.module';
import { ImagesModule } from './modules/common/images.module';
import { CashAccountModule } from './modules/payment/cash-account.module';
import { CashPaymentModule } from './modules/payment/cash-payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        retryWrites: false,
      }),
    }),
    AuditLogModule,
    AuthModule,
    CompaniesModule,
    BankDetailsModule,
    OwnersModule,
    TrucksModule,
    DriversModule,
    GstConfigurerModule,
    MaterialModule,
    ClientModule,
    ClientBranchModule,
    DealerModule,
    TransportRateModule,
    BunkAssignModule,
    AccountAssignModule,
    ActionsModule,
    PincodeModule,
    DeliveryChallanModule,
    ImagesModule,
    CashAccountModule,
    CashPaymentModule,
  ],
})
export class AppModule {}