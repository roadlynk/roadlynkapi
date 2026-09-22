import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { errorCode } from '../../common/error.index';

interface RawPincodeRecord {
  officename: string;
  pincode: string;
  district: string;
  statename: string;
}

export interface PincodeLookupResult {
  statename: string;
  district: string;
  pincode: string;
  officename: string[];
}

@Injectable()
export class PincodeService implements OnModuleInit {
  private readonly pincodeIndex = new Map<string, PincodeLookupResult>();

  onModuleInit() {
    this.buildIndex();
  }

  private buildIndex() {
    const candidatePaths = [
      join(process.cwd(), 'src', 'data', 'pincode.json'),
      join(process.cwd(), 'data', 'pincode.json'),
      join(__dirname, '../../../src/data/pincode.json'),
      join(__dirname, '../../data/pincode.json'),
    ];

    const filePath = candidatePaths.find((path) => existsSync(path));

    if (!filePath) {
      throw new Error(
        `Pincode data file not found. Tried: ${candidatePaths.join(', ')}`,
      );
    }

    const raw = readFileSync(filePath, 'utf-8');
    const { records } = JSON.parse(raw) as { records: RawPincodeRecord[] };

    for (const record of records) {
      const existing = this.pincodeIndex.get(record.pincode);

      if (existing) {
        existing.officename.push(record.officename);
        continue;
      }

      this.pincodeIndex.set(record.pincode, {
        statename: record.statename,
        district: record.district,
        pincode: record.pincode,
        officename: [record.officename],
      });
    }
  }

  findByPincode(pincode: string): PincodeLookupResult {
    const result = this.pincodeIndex.get(pincode);

    if (!result) {
      throw new NotFoundException({
        message: 'No records found for the given pincode',
        error_code: errorCode.apiCommon.notFound,
      });
    }

    return result;
  }
}
