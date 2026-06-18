const stagingModels = [
  {
    name: "stg_customer",
    source: "raw_customer",
    sql: ctx => `SELECT TRIM(customer_id) AS customer_id, INITCAP(TRIM(customer_name)) AS customer_name,
          UPPER(TRIM(gender)) AS gender, dob, INITCAP(TRIM(city)) AS city,
          INITCAP(TRIM(state)) AS state, UPPER(TRIM(region)) AS region,
          join_date, LOWER(TRIM(customer_type)) AS customer_type,
          TRIM(plan_id) AS plan_id, LOWER(TRIM(status)) AS status
          FROM ${ctx.ref("raw_customer")} WHERE customer_id IS NOT NULL`
  },
  {
    name: "stg_plan",
    source: "raw_plan",
    sql: ctx => `SELECT TRIM(plan_id) AS plan_id, INITCAP(TRIM(plan_name)) AS plan_name,
          LOWER(TRIM(plan_category)) AS plan_category, ROUND(monthly_charge, 2) AS monthly_charge,
          data_limit_gb, UPPER(TRIM(voice_limit)) AS voice_limit, UPPER(TRIM(sms_limit)) AS sms_limit
          FROM ${ctx.ref("raw_plan")} WHERE plan_id IS NOT NULL`
  },
  {
    name: "stg_recharge",
    source: "raw_recharge",
    sql: ctx => `SELECT TRIM(recharge_id) AS recharge_id, TRIM(customer_id) AS customer_id,
          recharge_date, ROUND(amount, 2) AS amount,
          INITCAP(TRIM(payment_mode)) AS payment_mode, INITCAP(TRIM(channel)) AS channel
          FROM ${ctx.ref("raw_recharge")} WHERE recharge_id IS NOT NULL AND customer_id IS NOT NULL`
  },
  {
    name: "stg_cdr",
    source: "raw_cdr",
    sql: ctx => `SELECT TRIM(cdr_id) AS cdr_id, TRIM(customer_id) AS customer_id,
          usage_date, TRIM(tower_id) AS tower_id,
          COALESCE(voice_minutes, 0) AS voice_minutes,
          COALESCE(sms_count, 0) AS sms_count, COALESCE(data_mb, 0) AS data_mb
          FROM ${ctx.ref("raw_cdr")} WHERE cdr_id IS NOT NULL AND customer_id IS NOT NULL`
  },
  {
    name: "stg_tower",
    source: "raw_tower",
    sql: ctx => `SELECT TRIM(tower_id) AS tower_id, INITCAP(TRIM(tower_name)) AS tower_name,
          INITCAP(TRIM(city)) AS city, INITCAP(TRIM(state)) AS state,
          UPPER(TRIM(region)) AS region, UPPER(TRIM(technology)) AS technology
          FROM ${ctx.ref("raw_tower")} WHERE tower_id IS NOT NULL`
  },
  {
    name: "stg_network_kpi",
    source: "raw_network_kpi",
    sql: ctx => `SELECT TRIM(kpi_id) AS kpi_id, TRIM(tower_id) AS tower_id, kpi_date,
          ROUND(availability_pct, 2) AS availability_pct,
          ROUND(call_drop_pct, 2) AS call_drop_pct, COALESCE(latency_ms, 0) AS latency_ms
          FROM ${ctx.ref("raw_network_kpi")} WHERE kpi_id IS NOT NULL AND tower_id IS NOT NULL`
  },
  {
    name: "stg_complaints",
    source: "raw_complaints",
    sql: ctx => `SELECT TRIM(ticket_id) AS ticket_id, TRIM(customer_id) AS customer_id,
          ticket_date, INITCAP(TRIM(issue_type)) AS issue_type,
          INITCAP(TRIM(resolution_status)) AS resolution_status,
          COALESCE(resolution_days, 0) AS resolution_days
          FROM ${ctx.ref("raw_complaints")} WHERE ticket_id IS NOT NULL AND customer_id IS NOT NULL`
  }
];

stagingModels.forEach(model => {
  publish(model.name, {
    type: "table",
    schema: "stg",
    description: `Cleaned and standardized ${model.name} data`
  }).query(ctx => model.sql(ctx));
});