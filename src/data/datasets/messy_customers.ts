/**
 * Bundled small messy datasets for offline EDA, Pandas cleaning, SQL joins,
 * and feature engineering lessons/labs (zero external network fetches).
 */

export const MESSY_CUSTOMERS_CSV = `customer_id,email,country,age,monthly_spend,signup_date,plan_tier
101,  Alice.Kim@Example.COM ,us,29,"$1,250.50",2024-01-15,pro
102,bob.omar@example.com,U.S.,34,420.00,2024/02/03,free
103,sara.ali@example.com,UK,-4,N/A,2024-02-19,starter
101,alice.kim@example.com,USA,29,"$1,250.50",2024-01-15,pro
104,TARIQ.HASSAN@CORP.IO,ae,41,890.25,2024-03-01,Enterprise
105,mina.patel@example.com,United Kingdom,205,"",2024-03-11,free
106,jon.doe@example.com,uk,31,null,2024-04-05,starter
107,nadia.mansour@example.com,EG,27,$310.00,04/18/2024,pro
108,chen.wei@example.com,CA,38,640.75,2024-05-02,pro
109,  elena.silva@example.com,es,45,1520.00,2024-05-14,enterprise
110,david.ng@example.com,USA,22,0,2024-06-01,free
111,fatima.z@example.com,AE,33,775.40,2024-06-19,pro
112,no_at_symbol.example,DE,28,199.99,2024-07-04,starter
113,lucas.meyer@example.com,de,36,"$2,100.00",2024-07-22,Enterprise
114,priya.nair@example.com,IN,30,450.00,2024-08-09,starter
`;

export const MESSY_ORDERS_CSV = `order_id,customer_id,order_ts,amount,status
5001,101,2024-02-01 09:15:00,250.00,completed
5002,101,2024-02-14 14:22:00,400.00,completed
5003,102,2024-02-20 11:05:00,120.00,completed
5004,103,2024-03-02 18:40:00,75.00,refunded
5005,104,2024-03-10 08:00:00,890.25,completed
5006,101,2024-03-15 16:45:00,600.50,completed
5007,107,2024-04-25 12:10:00,310.00,completed
5008,108,2024-05-10 10:30:00,320.25,completed
5009,108,2024-05-24 19:00:00,320.50,completed
5010,109,2024-06-01 07:50:00,1520.00,completed
5011,111,2024-06-25 13:20:00,775.40,completed
5012,113,2024-07-29 15:05:00,2100.00,completed
5013,999,2024-08-01 09:00:00,99.00,completed
5014,106,2024-08-05 17:30:00,45.00,cancelled
5015,114,2024-08-18 11:45:00,450.00,completed
`;

export const MESSY_TICKETS_JSON = JSON.stringify(
  [
    {
      ticket_id: 'T-901',
      customer_id: 101,
      created_at: '2024-03-16T10:00:00Z',
      priority: 'high',
      channel: 'email',
      subject: '  Billing invoice mismatch on Pro plan!!  ',
      resolved_hours: 4.5,
    },
    {
      ticket_id: 'T-902',
      customer_id: 103,
      created_at: '2024-03-03T12:30:00Z',
      priority: null,
      channel: 'chat',
      subject: 'Refund still pending after 5 days',
      resolved_hours: 36.0,
    },
    {
      ticket_id: 'T-903',
      customer_id: 104,
      created_at: '2024-04-01T08:15:00Z',
      priority: 'HIGH',
      channel: 'api_webhook',
      subject: 'Rate limit 429 on batch ingestion endpoint',
      resolved_hours: 2.0,
    },
    {
      ticket_id: 'T-904',
      customer_id: 109,
      created_at: '2024-06-10T16:20:00Z',
      priority: 'medium',
      channel: 'email',
      subject: 'SSO SAML certificate renewal question',
      resolved_hours: null,
    },
    {
      ticket_id: 'T-905',
      customer_id: 112,
      created_at: '2024-07-06T09:45:00Z',
      priority: 'low',
      channel: 'chat',
      subject: 'Typo in email address during signup',
      resolved_hours: 1.2,
    },
  ],
  null,
  2
);
