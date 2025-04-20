const tableClient = require("./azureTableService");

const args = process.argv.slice(2);
const command = args[0];

const addEntity = async (userId, actionType, status, ipAddress, userAgent, timestamp) => {
  try {
    const entity = {
      partitionKey: `auth-${timestamp.slice(0, 6)}`,
      rowKey: timestamp.replace(/[:\-]/g, "") + "Z", 
      userId,
      actionType,
      status,
      ipAddress,
      userAgent,
      timestamp,
    };
    await tableClient.createEntity(entity);
    console.log("Entity added:", entity);
  } catch (error) {
    console.error("Error adding entity:", error.message);
  }
};

const listEntities = async () => {
  try {
    const entities = [];
    for await (const entity of tableClient.listEntities()) {
      entities.push(entity);
    }
    console.log("Entities:");
    console.table(entities);
  } catch (error) {
    console.error("Error listing entities:", error.message);
  }
};

const editEntity = async (rowKey, partitionKey, userId, actionType, status, ipAddress, userAgent, timestamp) => {
  try {
    const updatedEntity = {
      partitionKey,
      rowKey,
      userId,
      actionType,
      status,
      ipAddress,
      userAgent,
      timestamp,
    };
    await tableClient.updateEntity(updatedEntity, "Replace");
    console.log("Entity updated:", updatedEntity);
  } catch (error) {
    console.error("Error updating entity:", error.message);
  }
};

const deleteEntity = async (partitionKey, rowKey) => {
  try {
    await tableClient.deleteEntity(partitionKey, rowKey);
    console.log(`Entity with PartitionKey "${partitionKey}" and RowKey "${rowKey}" deleted.`);
  } catch (error) {
    console.error("Error deleting entity:", error.message);
  }
};

const showUsage = () => {
  console.log("Invalid command. Use:");
  console.log("   node index.js add <userId> <actionType> <status> <ipAddress> <userAgent> <timestamp>");
  console.log("   node index.js list");
  console.log("   node index.js edit <rowKey> <partitionKey> <userId> <actionType> <status> <ipAddress> <userAgent> <timestamp>");
  console.log("   node index.js delete <partitionKey> <rowKey>");
};

(async () => {
  try {
    switch (command) {
      case "add": {
        const [userId, actionType, status, ipAddress, userAgent, timestamp] = args.slice(1);
        if (!userId || !actionType || !status || !ipAddress || !userAgent || !timestamp) {
          return console.error("Usage: node index.js add <userId> <actionType> <status> <ipAddress> <userAgent> <timestamp>");
        }
        await addEntity(userId, actionType, status, ipAddress, userAgent, timestamp);
        break;
      }
      case "list":
        await listEntities();
        break;
      case "edit": {
        const [rowKey, partitionKey, userId, actionType, status, ipAddress, userAgent, timestamp] = args.slice(1);
        if (!rowKey || !partitionKey || !userId || !actionType || !status || !ipAddress || !userAgent || !timestamp) {
          return console.error("Usage: node index.js edit <rowKey> <partitionKey> <userId> <actionType> <status> <ipAddress> <userAgent> <timestamp>");
        }
        await editEntity(rowKey, partitionKey, userId, actionType, status, ipAddress, userAgent, timestamp);
        break;
      }
      case "delete": {
        const [partitionKey, rowKey] = args.slice(1);
        if (!partitionKey || !rowKey) {
          return console.error("Usage: node index.js delete <partitionKey> <rowKey>");
        }
        await deleteEntity(partitionKey, rowKey);
        break;
      }
      default:
        showUsage();
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error.message);
  }
})();