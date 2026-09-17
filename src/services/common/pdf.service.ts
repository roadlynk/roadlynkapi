import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import * as Handlebars from 'handlebars';

@Injectable()
export class PdfService {
  async generateFromTemplate(
    templatePath: string,
    data: Record<string, unknown>,
  ): Promise<Buffer> {
    const templateSource = readFileSync(templatePath, 'utf-8');
    const template = Handlebars.compile(templateSource);
    const html = template(data);

    // puppeteer is an ESM-only package, so it must be loaded via dynamic import in this CommonJS project
    const puppeteer = await import('puppeteer');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdf = await page.pdf({ format: 'A4', printBackground: true });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }
}
