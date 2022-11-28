import { Component, ElementRef, VERSION, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import jsPDF from 'jspdf';
import htmlToPdfmake from 'html-to-pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  name = 'Angular ' + VERSION.major;

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;

  @ViewChild('TABLE', { static: false }) TABLE: ElementRef;
  @ViewChild('pdfTable') pdfTable: ElementRef;

  @ViewChild('pdfViewer') pdfViewer!: ElementRef;

  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.TABLE.nativeElement
    );
    for (var i in ws) {
      if (typeof ws[i] != 'object') continue;
      let cell = XLSX.utils.decode_cell(i);

      // ws[i] = {wch: ws[i].toString().length}
      ws[i].s = {
        // styling for all cells
        font: {
          name: 'arial',
        },
        alignment: {
          vertical: 'center',
          horizontal: 'center',
          wrapText: '1', // any truthy value here
        },
        border: {
          right: {
            style: 'thin',
            color: '000000',
          },
          left: {
            style: 'thin',
            color: '000000',
          },
        },
      };

      if (cell.c == 6) {
        // first column
        ws[i].s.numFmt = 'DD-MM-YYYY'; // for dates
        ws[i].z = 'DD-MM-YYYY';
      } else {
        ws[i].s.numFmt = '00'; // other numbers
      }

      if (cell.r == 0) {
        // first row
        ws[i].s.border.bottom = {
          // bottom border
          style: 'thin',
          color: '000000',
        };
      }

      if (cell.r % 2) {
        // every other row
        ws[i].s.fill = {
          // background color
          patternType: 'solid',
          fgColor: { rgb: 'b2b2b2' },
          bgColor: { rgb: 'b2b2b2' },
        };
      }
    }

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    console.log(wb);
    XLSX.writeFile(wb, 'ScoreSheet.xlsx');
  }

  exportPDFMaker() {
    let isWatermark = false;
    let watermarkText = 'Cópia Controlada';
    var docDefinition = {
      pageSize: 'A4',
      pageMargins: [20, 45, 20, 45],
      watermark: {
        text: watermarkText,
        color: 'blue',
        opacity: isWatermark ? 0.2 : 0,
        bold: true,
        italics: false,
      },
      content: [
        {
          image: 'logo',
          width: 120,
          height: 40,
          absolutePosition: { x: 400, y: 35 },
          alignment: 'right',
        },
        {
          style: 'header',
          text: 'Revisão de Projeto',
          // margin: [0, 0, 150, 0],
          // pageBreak: 'after'
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 15,
              x2: 595 - 2 * 20,
              y2: 15,
              lineWidth: 0.5,
              color: '#ddd',
            },
          ],
        },
        {
          style: 'tableExample',
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        { text: 'Identificação:', style: 'lineHeader' },
                        {
                          text: 'Nome Identificador da Obra',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Cliente:', style: 'lineHeader' },
                        {
                          text: 'Nome do Cliente',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Proprietário:', style: 'lineHeader' },
                        { text: 'Nome do Proprietário', style: 'lineBody' },
                      ],
                      [
                        { text: 'Finalidade:', style: 'lineHeader' },
                        {
                          text: 'Nome da Finalidade',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Local:', style: 'lineHeader' },
                        {
                          text: 'Estado - UF',
                          style: 'lineBody',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                    // vLineColor: function (i, node) {
                    //   return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
                    // },
                    // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    // paddingLeft: function(i, node) { return 4; },
                    // paddingRight: function(i, node) { return 4; },
                    // paddingTop: function(i, node) { return 2; },
                    // paddingBottom: function(i, node) { return 2; },
                    // fillColor: function (rowIndex, node, columnIndex) { return null; }
                  },
                },
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      // [{ text: 'Header 1', style: 'tableHeader' }, { text: 'Header 2', style: 'tableHeader' }, { text: 'Header 3', style: 'tableHeader' }],
                      [
                        { text: 'Gestor Interno:', style: 'lineHeader' },
                        {
                          text: 'Nome do Gestor Interno',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Solicitante:', style: 'lineHeader' },
                        {
                          text: 'Nome do Solicitante',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Data de Criação', style: 'lineHeader' },
                        {
                          text: '00/00/0000 00:00:00',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Solicitado para:', style: 'lineHeader' },
                        {
                          text: '00/00/0000',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Número do Desenho:', style: 'lineHeader' },
                        {
                          text: 'D-000000',
                          style: 'lineBody',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 0 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#ddd' : '#ddd';
            },
            // vLineColor: function (i, node) {
            //   return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
            // },
            // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
            // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
            // paddingLeft: function(i, node) { return 4; },
            // paddingRight: function(i, node) { return 4; },
            // paddingTop: function(i, node) { return 2; },
            // paddingBottom: function(i, node) { return 2; },
            // fillColor: function (rowIndex, node, columnIndex) { return null; }
          },
        },
        {
          style: 'tableExample',
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '-- Observações --',
                  style: 'tableTitle',
                },
              ],
              [
                {
                  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                  style: 'tableText',
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 0 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#ddd' : '#ddd';
            },
            // vLineColor: function (i, node) {
            //   return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
            // },
            // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
            // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
            // paddingLeft: function(i, node) { return 4; },
            // paddingRight: function(i, node) { return 4; },
            // paddingTop: function(i, node) { return 2; },
            // paddingBottom: function(i, node) { return 2; },
            // fillColor: function (rowIndex, node, columnIndex) { return null; }
          },
        },
      ],
      images: {
        logo: 'data:image/png;base64,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',
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 0],
          border: [true, true, true, true],
        },
        tableExample: {
          margin: [10, 35, 10, 15],
        },
        lineHeader: {
          fontSize: 10,
          bold: true,
          color: '#4e4e4e',
        },
        lineBody: {
          fontSize: 10,
          color: '#4e4e4e',
          alignment: 'right',
        },
        tableTitle: {
          fontSize: 10,
          alignment: 'center',
          color: '#3543e9',
        },
        tableText: {
          margin: [0, 10, 0, 10],
          fontSize: 10,
          alignment: 'justify',
          color: '#4e4e4e',
        },
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  exportPDFMaker1() {
    let isWatermark = true;
    let watermarkText = 'Cópia Controlada';
    var docDefinition = {
      pageSize: 'A4',
      pageMargins: [20, 45, 20, 45],
      watermark: {
        text: watermarkText,
        color: 'blue',
        opacity: isWatermark ? 0.2 : 0,
        bold: true,
        italics: false,
      },
      content: [
        {
          style: 'tableExample',
          table: {
            widths: ['100%'],
            headerRows: 1,
            body: [
              [
                [
                  {
                    image: 'logo',
                    width: 120,
                    height: 40,
                    absolutePosition: { x: 400, y: -10 },
                    alignment: 'right',
                  },
                  {
                    style: 'header',
                    text: 'Remessa de Projeto',
                    // margin: [0, 0, 150, 0],
                    // pageBreak: 'after'
                  },
                  {
                    canvas: [
                      {
                        type: 'line',
                        x1: 0,
                        y1: 15,
                        x2: 595 - 2 * 20,
                        y2: 15,
                        lineWidth: 0.5,
                        color: '#ddd',
                      },
                    ],
                  },
                ],
              ],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 0 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#ddd' : '#ddd';
            },
          },
        },

        {
          style: 'tableExample',
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        { text: 'Identificação:', style: 'lineHeader' },
                        {
                          text: 'Nome Identificador da Obra',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Cliente:', style: 'lineHeader' },
                        {
                          text: 'Nome do Cliente',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Proprietário:', style: 'lineHeader' },
                        { text: 'Nome do Proprietário', style: 'lineBody' },
                      ],
                      [
                        { text: 'Tipo de remessa:', style: 'lineHeader' },
                        {
                          text: 'Nome do Tipo de remessa',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Finalidade:', style: 'lineHeader' },
                        {
                          text: 'Nome da Finalidade',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Local:', style: 'lineHeader' },
                        {
                          text: 'Estado - UF',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Gestor interno:', style: 'lineHeader' },
                        {
                          text: 'Nome do Gestor interno',
                          style: 'lineBody',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                    // vLineColor: function (i, node) {
                    //   return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
                    // },
                    // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
                    // paddingLeft: function(i, node) { return 4; },
                    // paddingRight: function(i, node) { return 4; },
                    // paddingTop: function(i, node) { return 2; },
                    // paddingBottom: function(i, node) { return 2; },
                    // fillColor: function (rowIndex, node, columnIndex) { return null; }
                  },
                },
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      // [{ text: 'Header 1', style: 'tableHeader' }, { text: 'Header 2', style: 'tableHeader' }, { text: 'Header 3', style: 'tableHeader' }],
                      [
                        { text: 'Executor:', style: 'lineHeader' },
                        {
                          text: 'Nome do Executor',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Solicitante:', style: 'lineHeader' },
                        {
                          text: 'Nome do Solicitante',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Data criação', style: 'lineHeader' },
                        {
                          text: '00/00/0000 00:00:00',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Solicitado para:', style: 'lineHeader' },
                        {
                          text: '00/00/0000',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Número desenho:', style: 'lineHeader' },
                        {
                          text: 'D-000000',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Localização:', style: 'lineHeader' },
                        {
                          text: 'Localização da Obra',
                          style: 'lineBody',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 0 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#ddd' : '#ddd';
            },
            // vLineColor: function (i, node) {
            //   return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
            // },
            // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
            // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
            // paddingLeft: function(i, node) { return 4; },
            // paddingRight: function(i, node) { return 4; },
            // paddingTop: function(i, node) { return 2; },
            // paddingBottom: function(i, node) { return 2; },
            // fillColor: function (rowIndex, node, columnIndex) { return null; }
          },
        },
        {
          style: 'tableBlock',
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Dimensões --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        { text: 'Dimensões:', style: 'lineHeader' },
                        {
                          text: '00,00m x 00,00m',
                          style: 'lineBody',
                        },
                      ],
                      [
                        {
                          text: 'Pé direito min livre (sob o banzo inf):',
                          style: 'lineHeader',
                        },
                        {
                          text: '00,00m',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Vão do Roll-on:', style: 'lineHeader' },
                        { text: 'Nome do Tipo', style: 'lineBody' },
                      ],
                      [
                        { text: 'Limite de altura:', style: 'lineHeader' },
                        {
                          text: 'Sim/Não',
                          style: 'lineBody',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Estrutura --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        { text: 'Tipo:', style: 'lineHeader' },
                        {
                          text: 'Descrição do Tipo de Estrutura',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Observação:', style: 'lineHeader' },
                        {
                          text: 'Texto descritivo da observação',
                          style: 'lineBody',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 0 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#ddd' : '#ddd';
            },
          },
        },
        {
          style: 'tableBlock',
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Cobertura --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        { text: 'Tipo:', style: 'lineHeader' },
                        {
                          text: 'Qtd. águas : 0,00un',
                          style: 'lineBody',
                        },
                      ],
                      [
                        {
                          text: 'Apoio:',
                          style: 'lineHeader',
                        },
                        {
                          text: 'Melhor Solução',
                          style: 'lineBody',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Balanço --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        {
                          text: 'Não Considerar',
                          style: 'lineHeader',
                          colSpan: 2,
                        },
                        '',
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 0 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#ddd' : '#ddd';
            },
          },
        },
        {
          style: 'tableBlock',
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Sobrecarga --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        { text: 'Predominante:', style: 'lineHeader' },
                        {
                          text: '00,00 Kgf/m² + 00,00 Kgf/m²',
                          style: 'lineBody',
                        },
                      ],
                      [
                        {
                          text: 'Localizada:',
                          style: 'lineHeader',
                        },
                        {
                          text: 'Kgf/m² + Kgf/m²',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Local:', style: 'lineHeader' },
                        { text: '', style: 'lineBody' },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Intercolúnio da viga de apoio --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        {
                          text: 'Análise Projeto',
                          style: 'lineHeader',
                          colSpan: 2,
                        },
                        '',
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 0 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#ddd' : '#ddd';
            },
          },
        },
        {
          style: 'tableBlock',
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Calhas --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        { text: 'Disposição:', style: 'lineHeader' },
                        {
                          text: 'Interna',
                          style: 'lineBody',
                        },
                      ],
                      [
                        {
                          text: 'Material:',
                          style: 'lineHeader',
                        },
                        {
                          text: 'Metálica',
                          style: 'lineBody',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Iluminação Natural --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        { text: 'Tipo:', style: 'lineHeader' },
                        {
                          text: 'Descrição do Tipo de Iluminação',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Área:', style: 'lineHeader' },
                        {
                          text: '00,00',
                          style: 'lineBody',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 0 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#ddd' : '#ddd';
            },
          },
        },
        {
          style: 'tableBlock',
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Isolamento Térmico --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        { text: 'Tipo:', style: 'lineHeader' },
                        {
                          text: 'Descrição do Tipo Isolamento',
                          style: 'lineBody',
                        },
                      ],
                      [
                        {
                          text: 'Área:',
                          style: 'lineHeader',
                        },
                        {
                          text: '00,00',
                          style: 'lineBody',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Ventilação --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        {
                          text: 'Não Considerar',
                          style: 'lineHeader',
                          colSpan: 2,
                        },
                        '',
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 0 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#ddd' : '#ddd';
            },
          },
        },
        {
          style: 'tableBlock',
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Fechamento --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        { text: 'Tipo:', style: 'lineHeader' },
                        {
                          text: 'Descrição do Tipo Fechamento',
                          style: 'lineBody',
                        },
                      ],
                      [
                        {
                          text: 'Localização:',
                          style: 'lineHeader',
                        },
                        {
                          text: 'Localização do Fechamento',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Alinhamento superior:', style: 'lineHeader' },
                        { text: 'Descrição do alinhamento', style: 'lineBody' },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Diversos --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        { text: 'Reserva técnica:', style: 'lineHeader' },
                        {
                          text: 'Sim/Não',
                          style: 'lineBody',
                        },
                      ],
                      [
                        {
                          text: 'Material de terceiro faturamento direto:',
                          style: 'lineHeader',
                        },
                        {
                          text: 'Sim/Não',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Seguro / Carta fiança:', style: 'lineHeader' },
                        { text: 'Sim/Não', style: 'lineBody' },
                      ],
                      [
                        { text: 'Seguro da obra:', style: 'lineHeader' },
                        { text: 'Sim/Não', style: 'lineBody' },
                      ],
                      [
                        { text: 'Condomínio de obra:', style: 'lineHeader' },
                        { text: 'Sim/Não', style: 'lineBody' },
                      ],
                      [
                        {
                          text: 'Condições de pagamento fora do padrão:',
                          style: 'lineHeader',
                        },
                        { text: 'Sim/Não', style: 'lineBody' },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 0 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#ddd' : '#ddd';
            },
          },
        },
        {
          style: 'tableBlock',
          table: {
            widths: ['50%', '50%'],
            body: [
              [
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Dimensões --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        { text: 'Dimensões:', style: 'lineHeader' },
                        {
                          text: '00,00m x 00,00m',
                          style: 'lineBody',
                        },
                      ],
                      [
                        {
                          text: 'Pé direito min livre (sob o banzo inf):',
                          style: 'lineHeader',
                        },
                        {
                          text: '00,00m',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Vão do Roll-on:', style: 'lineHeader' },
                        { text: 'Nome do Tipo', style: 'lineBody' },
                      ],
                      [
                        { text: 'Limite de altura:', style: 'lineHeader' },
                        {
                          text: 'Sim/Não',
                          style: 'lineBody',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
                {
                  table: {
                    widths: ['*', 'auto'],
                    headerRows: 0,
                    body: [
                      [
                        {
                          text: '-- Estrutura --',
                          style: 'tableTitle',
                          colSpan: 2,
                        },
                        '',
                      ],
                      [
                        { text: 'Tipo:', style: 'lineHeader' },
                        {
                          text: 'Descrição do Tipo de Estrutura',
                          style: 'lineBody',
                        },
                      ],
                      [
                        { text: 'Observação:', style: 'lineHeader' },
                        {
                          text: 'Texto descritivo da observação',
                          style: 'lineBody',
                        },
                      ],
                    ],
                  },
                  layout: {
                    hLineWidth: function (i, node) {
                      return i === 0 || i === node.table.body.length ? 0 : 0.5;
                    },
                    vLineWidth: function (i, node) {
                      return i === 0 || i === node.table.widths.length ? 0 : 0;
                    },
                    hLineColor: function (i, node) {
                      return i === 0 || i === node.table.body.length
                        ? '#ddd'
                        : '#ddd';
                    },
                  },
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 0 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#ddd' : '#ddd';
            },
          },
        },
        {
          style: 'tableBlock',
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '-- Documentos --',
                  style: 'tableTitle',
                },
              ],
              [
                {
                  text: '',
                  style: 'tableText',
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 0 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#ddd' : '#ddd';
            },
          },
        },
        {
          style: 'tableBlock',
          table: {
            widths: ['100%'],
            body: [
              [
                {
                  text: '-- Observações --',
                  style: 'tableTitle',
                },
              ],
              [
                {
                  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
                  style: 'tableText',
                },
              ],
            ],
          },
          layout: {
            hLineWidth: function (i, node) {
              return i === 0 || i === node.table.body.length ? 0 : 0.5;
            },
            vLineWidth: function (i, node) {
              return i === 0 || i === node.table.widths.length ? 0 : 0;
            },
            hLineColor: function (i, node) {
              return i === 0 || i === node.table.body.length ? '#ddd' : '#ddd';
            },
          },
        },
      ],
      images: {
        logo: 'data:image/png;base64,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',
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 0],
          border: [true, true, true, true],
        },
        tableExample: {
          margin: [5, 0, 5, 15],
        },
        tableBlock: {
          margin: [5, 5, 5, 5],
        },
        lineHeader: {
          fontSize: 9,
          bold: true,
          color: '#4e4e4e',
        },
        lineBody: {
          fontSize: 9,
          color: '#4e4e4e',
          alignment: 'right',
        },
        tableTitle: {
          fontSize: 9,
          alignment: 'center',
          color: '#3543e9',
          colSpan: 2,
          fillColor: '#ddd',
        },
        tableText: {
          margin: [0, 10, 0, 10],
          fontSize: 9,
          alignment: 'justify',
          color: '#4e4e4e',
        },
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  // buildTableBody(data, columns) {
  //   var body = [];
  //   //push first and second row
  //   body.push(columns);
  //   data.forEach(function (row) {
  //     var dataRow = [];
  //     columns.forEach(function (column) {
  //       dataRow.push(JSON.stringify(row[column]));
  //     });
  //     body.push(dataRow);
  //   });
  //   return body;
  // }

  // table(data, columns) {
  //   return {
  //     style: 'sectionBody',
  //     table: {
  //       headerRows: 1,
  //       body: this.buildTableBody(data, columns),
  //     },
  //     layout: {
  //       fillColor: function (rowIndex, node, columnIndex) {
  //         // You can change condition according to your requirements
  //         return columnIndex === columns.length - 1 ? 'green' : 'grey';
  //       },

  //       hLineWidth: (i, node) =>
  //         i === 0 || i === node.table.widths.length ? 0 : 1,
  //       vLineWidth: () => 0,

  //       hLineColor: function (i) {
  //         return i === 1 ? 'black' : '#aaa';
  //       },
  //     },
  //   };
  // }
  // //Função para exportação do pdf com seus dados vindo de uma api (no nosso caso é mocado no proproprio TS, mas não muda muito)
  // ExportToPDF() {
  //   console.log(this.dataSource);
  //   let docDefinition = {
  //     content: [
  //       { text: 'Tabela Periodica!', style: 'sectionHeader' },

  //       this.table(this.dataSource, this.displayedColumns),
  //     ],
  //     styles: {
  //       sectionHeader: {
  //         fontSize: 16,
  //         color: 'blue',
  //       },
  //       sectionBody: {
  //         layout: 'noBorders',
  //       },
  //     },
  //   };
  //   pdfMake.createPdf(docDefinition).open();
  // }

  // //Função para exportação do PDF vindo diretamente do HTML
  // public downloadAsPDF() {
  //   let doc = new jsPDF();

  //   const pdfTable = this.pdfTable.nativeElement;

  //   var html = htmlToPdfmake(pdfTable.innerHTML);

  //   const documentDefinition = { content: html };
  //   pdfMake.createPdf(documentDefinition).open();
  // }

  // public exportHTMLToPDF() {
  //   const pdfViewer = this.pdfViewer.nativeElement;
  //   var html = htmlToPdfmake(pdfViewer.innerHTML);
  //   const documentDefinition = { content: html };
  //   pdfMake.createPdf(documentDefinition).download();
  // }
}
