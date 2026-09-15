const databasePrefix = "vitaline_restore_test_";
const restoredDatabases = db
  .adminCommand({ listDatabases: 1 })
  .databases.map((database) => database.name)
  .filter((databaseName) => databaseName.startsWith(databasePrefix));

if (restoredDatabases.length === 0) {
  throw new Error("No temporary restore database was created.");
}

let verificationFailed = false;

try {
  restoredDatabases.forEach((restoredDatabaseName) => {
    const suffix = restoredDatabaseName.slice(databasePrefix.length);
    const originalDatabaseName = `vitaline_${suffix}`;
    const originalDatabase = db.getSiblingDB(originalDatabaseName);
    const restoredDatabase = db.getSiblingDB(restoredDatabaseName);
    const collections = restoredDatabase.getCollectionNames();

    collections.forEach((collectionName) => {
      const originalCount = originalDatabase
        .getCollection(collectionName)
        .countDocuments({});
      const restoredCount = restoredDatabase
        .getCollection(collectionName)
        .countDocuments({});

      print(
        `${originalDatabaseName}.${collectionName}: ` +
          `${originalCount} original, ${restoredCount} restored`,
      );

      if (originalCount !== restoredCount) {
        verificationFailed = true;
      }
    });
  });
} finally {
  restoredDatabases.forEach((databaseName) => {
    db.getSiblingDB(databaseName).dropDatabase();
  });
}

if (verificationFailed) {
  throw new Error("Original and restored document counts do not match.");
}

print("Temporary restore databases were verified and removed.");
