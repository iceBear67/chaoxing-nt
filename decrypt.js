const crypto = require('crypto');
const path = require('path');
const fs = require('fs')

/**
 * Generates a unique AES-128 key for a given filename.
 * This script replicates the logic of the C++ function sub_1800024E0.
 *
 * @param {string} fullFilePath The full path to the .jscx file.
 * @returns {string} The generated 16-byte AES key.
 */
function generateKey(fullFilePath) {
  // Step 1: Extract the filename from the full path.
  // The C++ code finds the last '\' or '/' and takes the substring after it.
  const filename = path.basename(fullFilePath);
  console.log(`[+] Extracted Filename: ${filename}`);

  // Step 2: The Hash Chain.
  // ASSUMPTION: The function sub_180001B90 is MD5.
  // If this is incorrect, you must replace `md5Hash` with the correct algorithm.

  // First hash: md5(filename + "_chenxi")
  const input1 = `${filename}_chenxi`;
  const hash1 = md5Hash(input1);
  console.log(`[+] Hash 1 Input: "${input1}"`);
  console.log(`[+] Hash 1 Result (MD5): ${hash1}`);

  // Second hash: md5("chaoxing_" + hash1)
  const input2 = `chaoxing_${hash1}`;
  const hash2 = md5Hash(input2);
  console.log(`[+] Hash 2 Input: "${input2}"`);
  console.log(`[+] Hash 2 Result (MD5): ${hash2}`);

  // Step 3: Assemble the final key from the hash results.
  // The C++ code takes specific slices from the hashes and concatenates them.
  // Final Key = hash2.substr(1, 4) + "." + hash1.substr(7, 3) + "*" + hash2.substr(12, 7)
  const part1 = hash2.substring(1, 5); // Note: JS substring is end-exclusive, so 1 to 5
  const part2 = hash1.substring(7, 10);
  const part3 = hash2.substring(12, 19);

  const finalKey = `${part1}.${part2}*${part3}`;
  console.log(`[+] Assembled Key: ${finalKey}`);

  // Verify the key is 16 characters long (128 bits)
  if (finalKey.length !== 16) {
    throw new Error(`Generated key has invalid length: ${finalKey.length}. Expected 16.`);
  }

  return finalKey;
}

/**
 * Helper function to compute the MD5 hash of a string.
 * @param {string} data The string to hash.
 * @returns {string} The hexadecimal MD5 hash.
 */
function md5Hash(data) {
  return crypto.createHash('md5').update(data).digest('hex');
}


const startDir = process.cwd();

function walkSync(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkSync(fullPath);
      continue;
    }

    if (entry.isFile() && fullPath.endsWith("jscx")) {
      let dst = fullPath.replace(".jscx", ".js")
      try {
        // console.log(`Loading ${fullPath}...`);
        let key = generateKey(fullPath);
        // console.log(`Generated Key for ${fullPath}: ${key}`);
        let decipher = crypto.createDecipheriv("aes-128-ecb", key, '')
        fs.writeFileSync(dst, decipher.update(fs.readFileSync(fullPath).toString(), "base64", "utf-8"))
        fs.appendFileSync(dst, decipher.final("utf-8"));
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error(`Error loading ${fullPath}:`, err && err.message ? err.message : err);
        fs.unlinkSync(dst)
      }
    }
  }
}

walkSync(startDir);