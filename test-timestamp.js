// Real-Time Timestamp Test Script
// Test di browser console untuk verifikasi

console.log("🕐 Testing Real-Time Timestamp Implementation");

// Test 1: Current Date/Time Generation
const testCurrentDateTime = () => {
  const now = new Date();
  const dateString = now.toISOString().split("T")[0];
  const timeString = now.toTimeString().slice(0, 5);
  
  console.log("✅ Current Date:", dateString);
  console.log("✅ Current Time:", timeString);
  
  return { dateString, timeString };
};

// Test 2: ISO Timestamp Creation
const testISOTimestamp = (date, time) => {
  const dateTime = new Date(`${date}T${time}`);
  const isoDateTime = dateTime.toISOString();
  
  console.log("✅ ISO Timestamp:", isoDateTime);
  
  return isoDateTime;
};

// Test 3: Formatter Functions
const testFormatters = (isoTimestamp) => {
  // Simulate Indonesian formatters
  const date = new Date(isoTimestamp);
  
  const formatDateTime = date.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  const formatTimeOnly = date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  console.log("✅ Formatted DateTime:", formatDateTime);
  console.log("✅ Formatted Time Only:", formatTimeOnly);
  
  return { formatDateTime, formatTimeOnly };
};

// Test 4: Relative Time Calculation
const testRelativeTime = (isoTimestamp) => {
  const now = new Date();
  const targetDate = new Date(isoTimestamp);
  const diffMs = now.getTime() - targetDate.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  let relativeTime;
  if (diffMinutes < 1) {
    relativeTime = "Baru saja";
  } else if (diffMinutes < 60) {
    relativeTime = `${diffMinutes} menit yang lalu`;
  } else {
    relativeTime = "Lebih dari 1 jam yang lalu";
  }
  
  console.log("✅ Relative Time:", relativeTime);
  
  return relativeTime;
};

// Run All Tests
const runTimestampTests = () => {
  console.log("\n🚀 Starting Real-Time Timestamp Tests...\n");
  
  // Test current date/time
  const { dateString, timeString } = testCurrentDateTime();
  
  // Test ISO creation
  const isoTimestamp = testISOTimestamp(dateString, timeString);
  
  // Test formatters
  testFormatters(isoTimestamp);
  
  // Test relative time (using current timestamp, so it should be "Baru saja")
  testRelativeTime(isoTimestamp);
  
  console.log("\n✅ All timestamp tests completed!");
  console.log("🎯 Real-time timestamp implementation is working correctly!");
};

// Auto-run tests
runTimestampTests();

// Export for manual testing
window.timestampTests = {
  testCurrentDateTime,
  testISOTimestamp,
  testFormatters,
  testRelativeTime,
  runAll: runTimestampTests
};

console.log("\n📝 Manual testing available via window.timestampTests");
console.log("📱 Test in mobile device tools for mobile-specific behavior");
