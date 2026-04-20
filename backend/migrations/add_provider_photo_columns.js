const db = require("../config/db");

// Add provider and photo columns to users table
const addColumns = `
  ALTER TABLE users 
  ADD COLUMN provider VARCHAR(50) DEFAULT 'local',
  ADD COLUMN photo VARCHAR(500) NULL
`;

db.query(addColumns, (err, result) => {
  if (err) {
    console.error("Error adding columns:", err);
    
    // Check if columns already exist
    if (err.code === 'ER_DUP_FIELDNAME' || err.message.includes('already exists')) {
      console.log("Columns already exist, skipping migration");
      process.exit(0);
    }
    
    process.exit(1);
  }
  
  console.log("Successfully added provider and photo columns to users table");
  process.exit(0);
});
