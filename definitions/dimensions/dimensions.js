const dimensionModels = [
  {
    name: "dim_customer",
    sql: ctx => `SELECT
      ROW_NUMBER() OVER ()                        AS customer_key,
      customer_id,
      customer_name,
      gender,
      dob,
      DATE_DIFF(CURRENT_DATE(), dob, YEAR)        AS age,
      city,
      state,
      region,
      join_date,
      DATE_DIFF(CURRENT_DATE(), join_date, YEAR)  AS tenure_years,
      customer_type,
      plan_id,
      status
    FROM ${ctx.ref("stg_customer")}`
  },
  {
    name: "dim_issue_type",
    sql: ctx => `SELECT DISTINCT
      ROW_NUMBER() OVER ()                        AS issue_type_key,
      issue_type,
      CASE
        WHEN issue_type = 'Network'       THEN 'Technical'
        WHEN issue_type = 'Billing'       THEN 'Financial'
        WHEN issue_type = 'SIM'           THEN 'Technical'
        WHEN issue_type = 'Data'          THEN 'Technical'
        WHEN issue_type = 'Voice'         THEN 'Technical'
        ELSE 'General'
      END                                         AS issue_category,
      CASE
        WHEN issue_type IN ('Network', 'Data', 'Voice') THEN 'High Priority'
        WHEN issue_type IN ('Billing', 'SIM')           THEN 'Medium Priority'
        ELSE 'Low Priority'
      END                                         AS priority_level
    FROM ${ctx.ref("stg_complaints")}
    WHERE issue_type IS NOT NULL`
  },
  {
    name: "dim_plan",
    sql: ctx => `SELECT
      ROW_NUMBER() OVER ()                        AS plan_key,
      plan_id,
      plan_name,
      plan_category,
      monthly_charge,
      ROUND(monthly_charge * 12, 2)               AS annual_charge,
      data_limit_gb,
      voice_limit,
      sms_limit,
      CASE
        WHEN monthly_charge < 200  THEN 'Budget'
        WHEN monthly_charge < 500  THEN 'Mid-Range'
        ELSE 'Premium'
      END                                         AS price_segment
    FROM ${ctx.ref("stg_plan")}`
  },
  {
    name: "dim_tower",
    sql: ctx => `SELECT
      ROW_NUMBER() OVER ()                        AS tower_key,
      tower_id,
      tower_name,
      city,
      state,
      region,
      technology
    FROM ${ctx.ref("stg_tower")}`
  },
  {
    name: "dim_date",
    sql: ctx => `SELECT DISTINCT
      ROW_NUMBER() OVER (ORDER BY recharge_date)  AS date_key,
      recharge_date                               AS calendar_date,
      EXTRACT(YEAR FROM recharge_date)            AS year,
      EXTRACT(MONTH FROM recharge_date)           AS month,
      EXTRACT(DAY FROM recharge_date)             AS day,
      EXTRACT(QUARTER FROM recharge_date)         AS quarter,
      FORMAT_DATE('%B', recharge_date)            AS month_name,
      FORMAT_DATE('%A', recharge_date)            AS day_name,
      CASE
        WHEN EXTRACT(DAYOFWEEK FROM recharge_date) IN (1,7) THEN 'Weekend'
        ELSE 'Weekday'
      END                                         AS day_type
    FROM ${ctx.ref("stg_recharge")}`
  },
  {
    name: "dim_payment_mode",
    sql: ctx => `SELECT DISTINCT
      ROW_NUMBER() OVER ()                        AS payment_mode_key,
      payment_mode
    FROM ${ctx.ref("stg_recharge")}`
  },
];



dimensionModels.forEach(model => {
  publish(model.name, {
    type: "table",
    schema: "dw",
    description: `Dimension table: ${model.name}`
  }).query(ctx => model.sql(ctx));
});