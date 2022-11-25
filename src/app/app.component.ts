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
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  name = 'Angular ' + VERSION.major;

  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource = ELEMENT_DATA;

  @ViewChild('TABLE', { static: false }) TABLE: ElementRef;
  @ViewChild('pdfTable') pdfTable: ElementRef;

  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.TABLE.nativeElement
    );
    for (var i in ws) {
      console.log(ws[i]);
      if (typeof ws[i] != 'object') continue;
      let cell = XLSX.utils.decode_cell(i);

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

  buildTableBody(data, columns) {
    var body = [];
    //push first and second row
    body.push(columns);
    data.forEach(function (row) {
      var dataRow = [];
      columns.forEach(function (column) {
        dataRow.push(JSON.stringify(row[column]));
      });
      body.push(dataRow);
    });
    return body;
  }

  table(data, columns) {
    return {
      style:'sectionBody',
      table: {
        headerRows: 1,
        body: this.buildTableBody(data, columns),
      },
      layout:  {
        fillColor: function(rowIndex, node, columnIndex) {
          // You can change condition according to your requirements
          return  columnIndex=== columns.length-1 ? 'green' : 'grey';
        },
        
        hLineWidth: (i,node) => (i===0 || i === node.table.widths.length ? 0: 1),
        vLineWidth: () => 0,
        
        hLineColor: function (i) {
          return i === 1 ? 'black' : '#aaa';
        },    
      },				
      }  
  }
  //Função para exportação do pdf com seus dados vindo de uma api (no nosso caso é mocado no proproprio TS, mas não muda muito)
  ExportToPDF() {
    console.log(this.dataSource);
    let docDefinition = {
      content: [
        { text: 'Tabela Periodica!', style: 'sectionHeader'},
        
        this.table(
          this.dataSource, this.displayedColumns)
      ],
      styles:{
        sectionHeader:{
          fontSize: 16,
          color: 'blue'
        },
        sectionBody:{
        layout: 'noBorders'
        }
      }
    };
    pdfMake.createPdf(docDefinition).open();
  }

  //Função para exportação do PDF vindo diretamente do HTML
  public downloadAsPDF() {
    let doc = new jsPDF();
   
    const pdfTable = this.pdfTable.nativeElement;
   
    var html = htmlToPdfmake(pdfTable.innerHTML);
     
    const documentDefinition = { content: html };
    pdfMake.createPdf(documentDefinition).open(); 
  }

}
