/**
 * Test String Similarity Utility
 * Run with: npx ts-node app/utils/stringSimilarity.test.ts
 */

import {
  calculateSimilarity,
  isSimilar,
  findSimilarStrings,
} from "./stringSimilarity";

console.log("=== String Similarity Tests ===\n");

// Test 1: Identical strings
const test1a = "What is cloud computing?";
const test1b = "What is cloud computing?";
const similarity1 = calculateSimilarity(test1a, test1b);
console.log(`Test 1 - Identical strings:`);
console.log(`  String 1: "${test1a}"`);
console.log(`  String 2: "${test1b}"`);
console.log(`  Similarity: ${similarity1}% (Expected: 100%)`);
console.log(`  Is Similar (>=85%): ${isSimilar(test1a, test1b)}\n`);

// Test 2: Very similar strings (>85%)
const test2a = "What is cloud computing?";
const test2b = "What is cloud computing services?";
const similarity2 = calculateSimilarity(test2a, test2b);
console.log(`Test 2 - Very similar strings:`);
console.log(`  String 1: "${test2a}"`);
console.log(`  String 2: "${test2b}"`);
console.log(`  Similarity: ${similarity2}% (Expected: >85%)`);
console.log(`  Is Similar (>=85%): ${isSimilar(test2a, test2b)}\n`);

// Test 3: Moderately similar strings (~70-80%)
const test3a = "What is cloud computing?";
const test3b = "What is edge computing?";
const similarity3 = calculateSimilarity(test3a, test3b);
console.log(`Test 3 - Moderately similar strings:`);
console.log(`  String 1: "${test3a}"`);
console.log(`  String 2: "${test3b}"`);
console.log(`  Similarity: ${similarity3}% (Expected: ~70-80%)`);
console.log(`  Is Similar (>=85%): ${isSimilar(test3a, test3b)}\n`);

// Test 4: Different strings
const test4a = "What is cloud computing?";
const test4b = "Explain the benefits of AWS Lambda";
const similarity4 = calculateSimilarity(test4a, test4b);
console.log(`Test 4 - Different strings:`);
console.log(`  String 1: "${test4a}"`);
console.log(`  String 2: "${test4b}"`);
console.log(`  Similarity: ${similarity4}% (Expected: <50%)`);
console.log(`  Is Similar (>=85%): ${isSimilar(test4a, test4b)}\n`);

// Test 5: Case and whitespace differences
const test5a = "What is Cloud Computing?";
const test5b = "what   is   cloud   computing?";
const similarity5 = calculateSimilarity(test5a, test5b);
console.log(`Test 5 - Case and whitespace differences:`);
console.log(`  String 1: "${test5a}"`);
console.log(`  String 2: "${test5b}"`);
console.log(`  Similarity: ${similarity5}% (Expected: 100%)`);
console.log(`  Is Similar (>=85%): ${isSimilar(test5a, test5b)}\n`);

// Test 6: Find similar strings from array
const targetQuestion = "What is AWS S3 used for?";
const existingQuestions = [
  "What is AWS S3 used for storage?",
  "What is Azure Blob storage?",
  "Explain AWS Lambda functions",
  "What is AWS S3?",
  "What is S3 in AWS?",
];

console.log(`Test 6 - Find similar questions in array:`);
console.log(`  Target: "${targetQuestion}"`);
console.log(`  Existing questions:`);
existingQuestions.forEach((q, i) => console.log(`    ${i + 1}. "${q}"`));
console.log(`  Results (>=85% similarity):`);
const results = findSimilarStrings(targetQuestion, existingQuestions, 85);
if (results.length > 0) {
  results.forEach((r) => console.log(`    - "${r.text}" (${r.similarity}%)`));
} else {
  console.log(`    None found`);
}
console.log();

// Test 7: Small typo differences
const test7a = "What are the benefits of microservices architecture?";
const test7b = "What are the benifits of microservice architecture?";
const similarity7 = calculateSimilarity(test7a, test7b);
console.log(`Test 7 - Small typo differences:`);
console.log(`  String 1: "${test7a}"`);
console.log(`  String 2: "${test7b}"`);
console.log(`  Similarity: ${similarity7}% (Expected: ~95%)`);
console.log(`  Is Similar (>=85%): ${isSimilar(test7a, test7b)}\n`);

console.log("=== Tests Complete ===");
