const factModels = [
  {
    name: "fact_revenue",
    sql: ctx => `SELECT
      ROW_NUMBER() OVER ()                        AS revenue_key,
      d.date_key,
      c.customer_key,
      p.plan_key,
      pm.payment_mode_key,
      r.amount                                    AS recharge_amount,
      1                                           AS transaction_count
    FROM ${ctx.ref("stg_recharge")}               r
    JOIN ${ctx.ref("dim_customer")}               c  ON r.customer_id   = c.customer_id
    JOIN ${ctx.ref("dim_plan")}                   p  ON c.plan_id       = p.plan_id
    JOIN ${ctx.ref("dim_payment_mode")}           pm ON r.payment_mode  = pm.payment_mode
    JOIN ${ctx.ref("dim_date")}                   d  ON r.recharge_date = d.calendar_date`
  }
];

factModels.forEach(model => {
  publish(model.name, {
    type: "table",
    schema: "dw",
    description: `Fact table: ${model.name}`
  }).query(ctx => model.sql(ctx));
});