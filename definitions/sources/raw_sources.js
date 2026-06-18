[
  "raw_customer",
  "raw_plan",
  "raw_recharge",
  "raw_cdr",
  "raw_tower",
  "raw_network_kpi",
  "raw_complaints"
].forEach(tableName => {
  declare({
    database: "project-70684428-1c6f-4305-a20",
    schema: "raw",
    name: tableName
  });
});