const crypto = require('crypto');
const path = require('path');

/**
 * AES Key Generation Calculator
 * Based on reverse engineering of CompileExt module
 */

function calculateAESKey(filePath) {
  console.log('='.repeat(80));
  console.log('AES Key Calculator for .jscx files');
  console.log('='.repeat(80));
  console.log(`\nInput file path: ${filePath}\n`);

  // Step 1: Extract filename from path
  const filename = path.basename(filePath);
  console.log(`Step 1: Extract filename`);
  console.log(`  Filename: ${filename}\n`);

  // Step 2: Create first MD5 hash (filename + "_chenxi")
  const firstInput = filename + '_chenxi';
  const md5Hash1 = crypto.createHash('md5').update(firstInput).digest('hex');
  console.log(`Step 2: First MD5 hash`);
  console.log(`  Input: "${firstInput}"`);
  console.log(`  MD5 Hash 1: ${md5Hash1}\n`);

  // Step 3: Build the key material string
  // Pattern: "chaoxing_" + md5_hash1 + "." + chars[1-4] + "." + chars[7-9] + "*" + chars[12-18]
  const chars_1_4 = md5Hash1.substring(1, 5);   // 4 chars starting at index 1
  const chars_7_9 = md5Hash1.substring(7, 10);  // 3 chars starting at index 7
  const chars_12_18 = md5Hash1.substring(12, 19); // 7 chars starting at index 12
  
  const keyMaterial = `chaoxing_${md5Hash1}.${chars_1_4}.${chars_7_9}*${chars_12_18}`;
  
  console.log(`Step 3: Build key material`);
  console.log(`  Pattern: "chaoxing_" + md5_hash1 + "." + substr(1,4) + "." + substr(7,3) + "*" + substr(12,7)`);
  console.log(`  Chars [1-4]:  "${chars_1_4}"`);
  console.log(`  Chars [7-9]:  "${chars_7_9}"`);
  console.log(`  Chars [12-18]: "${chars_12_18}"`);
  console.log(`  Key Material: "${keyMaterial}"\n`);

  // Step 4: Create final MD5 hash (this is the AES key)
  const aesKey = crypto.createHash('md5').update(keyMaterial).digest('hex');
  console.log(`Step 4: Final MD5 hash (AES Key)`);
  console.log(`  Input: "${keyMaterial}"`);
  console.log(`  AES Key: ${aesKey}\n`);

  console.log('='.repeat(80));
  console.log('RESULT:');
  console.log('='.repeat(80));
  console.log(`AES Key (hex): ${aesKey}`);
  console.log(`AES Key (length): ${aesKey.length} characters (${aesKey.length / 2} bytes)`);
  console.log('='.repeat(80));

  return {
    filename,
    firstInput,
    md5Hash1,
    keyMaterial,
    aesKey
  };
}

// Test with example files
console.log('\n');

// Example 1: Test with a sample .jscx file
const testFile1 = 'c:\\Users\\d3f4ult\\Desktop\\app\\electron\\common\\Account.jscx';
const result1 = calculateAESKey(testFile1);

console.log('\n\n');

// Example 2: Test with another file
const testFile2 = 'c:\\Users\\d3f4ult\\Desktop\\app\\electron\\main\\AppSystemConfigMainHelper.jscx';
const result2 = calculateAESKey(testFile2);

console.log('\n\n');

// Example 3: Simple filename
const testFile3 = 'test.jscx';
const result3 = calculateAESKey(testFile3);

console.log('\n\n');
console.log('To test with your own file, run:');
console.log('  node key_calculator.js <filepath>');
console.log('\nOr modify the test files in this script.\n');

// Allow command line usage
if (process.argv.length > 2) {
  console.log('\n\nCommand Line Test:');
  const customFile = process.argv[2];
  calculateAESKey(customFile);
}

// Export for use in other modules
module.exports = { calculateAESKey };
