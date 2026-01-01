import { defineDb, defineTable, column, NOW } from 'astro:db';

const Users = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    created_at: column.date({ default: NOW }),
  }
});

const Sessions = defineTable({
  columns: {
    id: column.text({ primaryKey: true }),
    userId: column.text({ references: () => Users.columns.id }),
    events: column.text(), // Storing JSON string of events
    created_at: column.date({ default: NOW }),
  }
});

// https://astro.build/db/config
export default defineDb({
  tables: {
    Users,
    Sessions
  }
});
