#!/usr/bin/env node

/**
 * Preview Excel File Structure
 * Shows the columns and first few rows to help understand the data structure
 */

const XLSX = require('xlsx');
const path = require('path');

const EXCEL_FILE = process.argv[2] || path.join(__dirname, '编号 (1).xlsx');

try {
  console.log('📊 Previewing Excel File Structure\n');
  console.log(`File: ${EXCEL_FILE}\n`);

  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  console.log(`Sheet: ${sheetName}`);
  console.log(`Total rows: ${data.length}\n`);

  if (data.length === 0) {
    console.log('⚠️  No data found');
    return;
  }

  // Show column names
  console.log('📋 Column Names:');
  const columns = Object.keys(data[0]);
  columns.forEach((col, index) => {
    console.log(`   ${index + 1}. ${col}`);
  });
  console.log('');

  // Show first 3 rows as examples
  console.log('📝 First 3 Rows (sample):');
  for (let i = 0; i < Math.min(3, data.length); i++) {
    console.log(`\nRow ${i + 1}:`);
    const row = data[i];
    Object.keys(row).forEach(key => {
      const value = row[key];
      if (value && value.toString().trim()) {
        console.log(`   ${key}: ${value}`);
      }
    });
  }

  console.log('\n✅ Preview complete!');
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
