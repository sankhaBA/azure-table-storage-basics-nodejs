const tableClient = require("./azureTableService");

const args = process.argv.slice(2);
const command = args[0];

const addEntity = async (name, age) => {
  try {
    const entity = {
      partitionKey: "users",
      rowKey: Date.now().toString(),
      name,
      age: parseInt(age, 10),
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

const editEntity = async (rowKey, name, age) => {
  try {
    const updatedEntity = {
      partitionKey: "users",
      rowKey,
      name,
      age: parseInt(age, 10),
    };
    await tableClient.updateEntity(updatedEntity, "Replace");
    console.log("Entity updated:", updatedEntity);
  } catch (error) {
    console.error("Error updating entity:", error.message);
  }
};

const deleteEntity = async (rowKey) => {
  try {
    await tableClient.deleteEntity("users", rowKey);
    console.log(`Entity with RowKey "${rowKey}" deleted.`);
  } catch (error) {
    console.error("Error deleting entity:", error.message);
  }
};

const showUsage = () => {
  console.log("Invalid command. Use:");
  console.log("   node index.js add <name> <age>");
  console.log("   node index.js list");
  console.log("   node index.js edit <rowKey> <name> <age>");
  console.log("   node index.js delete <rowKey>");
};

(async () => {
  try {
    switch (command) {
      case "add": {
        const [name, age] = args.slice(1);
        if (!name || !age) {
          return console.error("Usage: node index.js add <name> <age>");
        }
        await addEntity(name, age);
        break;
      }
      case "list":
        await listEntities();
        break;
      case "edit": {
        const [rowKey, name, age] = args.slice(1);
        if (!rowKey || !name || !age) {
          return console.error("Usage: node index.js edit <rowKey> <name> <age>");
        }
        await editEntity(rowKey, name, age);
        break;
      }
      case "delete": {
        const [rowKey] = args.slice(1);
        if (!rowKey) {
          return console.error("Usage: node index.js delete <rowKey>");
        }
        await deleteEntity(rowKey);
        break;
      }
      default:
        showUsage();
    }
  } catch (error) {
    console.error("An unexpected error occurred:", error.message);
  }
})();