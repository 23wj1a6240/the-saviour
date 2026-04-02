// ═══════════════════════════════════════════════════════════════
// THE SAVIOUR — MongoDB Database Schema Reference
// ═══════════════════════════════════════════════════════════════

// ─── COLLECTION: users ──────────────────────────────────────────
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "phone", "password", "role"],
      properties: {
        name:       { bsonType: "string",  description: "Full name" },
        phone:      { bsonType: "string",  description: "Unique phone number (login ID)" },
        email:      { bsonType: "string",  description: "Optional email address" },
        password:   { bsonType: "string",  description: "bcrypt hashed password" },
        role:       { enum: ["villager", "asha_worker"] },
        age:        { bsonType: "int" },
        gender:     { enum: ["male", "female", "other"] },
        village:    { bsonType: "string" },
        district:   { bsonType: "string" },
        state:      { bsonType: "string" },
        income:     { bsonType: "number",  description: "Annual income in INR" },
        language:   { enum: ["en", "hi", "te", "ta", "kn"], description: "Preferred language" },
        emergencyContacts: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              name:     { bsonType: "string" },
              phone:    { bsonType: "string" },
              relation: { bsonType: "string" }
            }
          }
        },
        assignedAshaWorker: { bsonType: "objectId", description: "Ref: users._id" },
        isActive:   { bsonType: "bool" },
        createdAt:  { bsonType: "date" }
      }
    }
  }
});

// ─── COLLECTION: healthrecords ───────────────────────────────────
db.createCollection("healthrecords", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId"],
      properties: {
        userId:        { bsonType: "objectId", description: "Ref: users._id" },
        symptoms:      { bsonType: "array", items: { bsonType: "string" } },
        diagnosis:     { bsonType: "string" },
        prescription:  { bsonType: "string" },
        doctorNotes:   { bsonType: "string" },
        bloodPressure: { bsonType: "string", description: "e.g. 120/80" },
        temperature:   { bsonType: "number", description: "In Fahrenheit" },
        weight:        { bsonType: "number", description: "In kg" },
        height:        { bsonType: "number", description: "In cm" },
        vaccinations: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              name:         { bsonType: "string" },
              date:         { bsonType: "date" },
              nextDue:      { bsonType: "date" },
              administered: { bsonType: "bool" }
            }
          }
        },
        visitDate:     { bsonType: "date" },
        recordedBy:    { bsonType: "objectId", description: "Ref: users._id (ASHA or self)" },
        encryptedData: { bsonType: "string",   description: "AES-256 encrypted sensitive data" },
        attachments:   { bsonType: "array",    items: { bsonType: "string" } }
      }
    }
  }
});

// ─── COLLECTION: emergencies ─────────────────────────────────────
db.createCollection("emergencies", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["userId"],
      properties: {
        userId: { bsonType: "objectId" },
        location: {
          bsonType: "object",
          properties: {
            latitude:  { bsonType: "number" },
            longitude: { bsonType: "number" },
            address:   { bsonType: "string" }
          }
        },
        description: { bsonType: "string" },
        status: { enum: ["active", "resolved", "acknowledged"] },
        alertsSent: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              phone:  { bsonType: "string" },
              status: { bsonType: "string" },
              sentAt: { bsonType: "date" }
            }
          }
        },
        respondedBy: { bsonType: "objectId" },
        resolvedAt:  { bsonType: "date" }
      }
    }
  }
});

// ─── INDEXES ─────────────────────────────────────────────────────
db.users.createIndex({ phone: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ assignedAshaWorker: 1 });
db.healthrecords.createIndex({ userId: 1, visitDate: -1 });
db.healthrecords.createIndex({ recordedBy: 1 });
db.emergencies.createIndex({ status: 1, createdAt: -1 });
db.emergencies.createIndex({ userId: 1 });
