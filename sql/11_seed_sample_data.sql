
INSERT INTO BRANCH (branch_name, address, phone) VALUES
    ('Colombo Main',   '42 Galle Road, Colombo 03',         '0112345678'),
    ('Kandy Central',  '18 Dalada Veediya, Kandy',          '0812345678'),
    ('Galle South',    '7 Church Street, Galle Fort, Galle','0912345678');
INSERT INTO AGENT (branch_id, agent_name, phone) VALUES
    (1, 'Nimal Perera',   '0771000001'),
    (1, 'Sanduni Silva',  '0771000002'),
    (2, 'Ruwan Fernando', '0771000003'), 
    (2, 'Dilsha Rajapaksa','0771000004'), 
    (3, 'Kasun Jayawardena','0771000005');

INSERT INTO CUSTOMER (branch_id, agent_id, full_name, dob, national_id, phone, email, customer_type) VALUES
    (1, 1, 'Amal Senanayake',    '1990-05-12', '901234567V',   '0701100001', 'amal@email.com',    'Individual'),
    (1, 1, 'Priya Wickramasinghe','2008-03-22', '200831500025', '0701100002', 'priya@email.com',   'Individual'),
    (1, 2, 'Lasith Mendis',      '1958-11-03', '583073500018', '0701100003', 'lasith@email.com',  'Individual'),
    (1, 2, 'Chamari De Silva',   '2019-07-15', '201919600033', '0701100004', NULL,                'Individual'),
    (1, 2, 'Tharaka Bandara',    '1985-09-30', '852741234X',   '0701100005', 'tharaka@email.com', 'Individual'),


    (2, 3, 'Nadeesha Kumari',    '1972-01-18', '720180500042', '0701100006', 'nadeesha@email.com','Individual'),
    (2, 3, 'Saman Rathnayake',   '1995-06-25', '951762345V',   '0701100007', 'saman@email.com',   'Individual'),
    (2, 4, 'Dilini Jayasinghe',  '2010-12-10', '201034500019', '0701100008', NULL,                'Individual'),
    (2, 4, 'Roshan Pathirana',   '1963-04-07', '630974500031', '0701100009', 'roshan@email.com',  'Individual'),
    (2, 4, 'Kavya Weerasinghe',  '1988-08-14', '882273456V',   '0701100010', 'kavya@email.com',   'Individual'),

    (3, 5, 'Naduni Dissanayake', '2004-07-18', '2004192345780',   '0701100011', 'naduni@email.com',  'Individual'),
    (3, 5, 'Bimal Cooray',       '1975-10-19', '752932345X',   '0701100012', 'bimal@email.com',   'Individual'),
    (3, 5, 'Thilini Perera',     '2015-06-03', '201515400027', '0701100013', NULL,                'Individual'),

    (1, 1, 'Suresh Gunasekara',  '1982-07-11', '822921234V',   '0701100014', 'suresh@email.com',  'Joint'),
    (1, 1, 'Amara Gunasekara',   '1984-03-25', '840852345V',   '0701100015', 'amara@email.com',   'Joint');

INSERT INTO SAVINGSACCOUNT (plan_id, account_number, opened_date, status, current_balance) VALUES
    (3, 'SA-00001', '2022-01-10', 'Active',  25000.00),  -- account_id=1,  Amal       (Adult)
    (2, 'SA-00002', '2023-03-15', 'Active',   8000.00),  -- account_id=2,  Priya      (Teen)
    (4, 'SA-00003', '2021-06-20', 'Active',  45000.00),  -- account_id=3,  Lasith     (Senior)
    (1, 'SA-00004', '2024-01-05', 'Active',   3500.00),  -- account_id=4,  Chamari    (Children)
    (3, 'SA-00005', '2020-09-12', 'Active',  60000.00),  -- account_id=5,  Tharaka    (Adult)
    (4, 'SA-00006', '2019-03-08', 'Active',  75000.00),  -- account_id=6,  Nadeesha   (Senior)
    (3, 'SA-00007', '2023-07-22', 'Active',  15000.00),  -- account_id=7,  Saman      (Adult)
    (2, 'SA-00008', '2024-02-14', 'Active',   6000.00),  -- account_id=8,  Dilini     (Teen)
    (4, 'SA-00009', '2018-11-30', 'Active',  90000.00),  -- account_id=9,  Roshan     (Senior)
    (3, 'SA-00010', '2022-05-17', 'Active',  30000.00),  -- account_id=10, Kavya      (Adult)
    (3, 'SA-00011', '2021-08-09', 'Active',  22000.00),  -- account_id=11, Hiruni     (Adult)
    (3, 'SA-00012', '2020-04-23', 'Active',  55000.00),  -- account_id=12, Bimal      (Adult)
    (1, 'SA-00013', '2024-05-30', 'Active',   2000.00),  -- account_id=13, Thilini    (Children)
    (5, 'SA-00014', '2022-10-01', 'Active', 120000.00);  -- account_id=14, Joint acct (Suresh+Amara)


-- -------------------------------------------------------
-- ACCOUNT HOLDERS  (link customers to their accounts)
-- -------------------------------------------------------
-- Each individual customer owns one account.
-- The joint account (SA-00014) is shared by two customers.

INSERT INTO ACCOUNTHOLDER (account_id, customer_id) VALUES
    ( 1,  1),   -- SA-00001 → Amal
    ( 2,  2),   -- SA-00002 → Priya
    ( 3,  3),   -- SA-00003 → Lasith
    ( 4,  4),   -- SA-00004 → Chamari
    ( 5,  5),   -- SA-00005 → Tharaka
    ( 6,  6),   -- SA-00006 → Nadeesha
    ( 7,  7),   -- SA-00007 → Saman
    ( 8,  8),   -- SA-00008 → Dilini
    ( 9,  9),   -- SA-00009 → Roshan
    (10, 10),   -- SA-00010 → Kavya
    (11, 11),   -- SA-00011 → Hiruni
    (12, 12),   -- SA-00012 → Bimal
    (13, 13),   -- SA-00013 → Thilini
    (14, 14),   -- SA-00014 → Suresh  (joint holder 1)
    (14, 15);   -- SA-00014 → Amara   (joint holder 2)


-- -------------------------------------------------------
-- FIXED DEPOSITS  (10 required by SRS)
-- -------------------------------------------------------
-- fd_plan_id: 1=6months@13%, 2=12months@14%, 3=36months@15%
-- next_interest_date = start_date + 30 days (first payout cycle)
-- Only accounts with sufficient balance open an FD.

INSERT INTO FIXEDDEPOSIT (account_id, fd_plan_id, principal_amount, start_date, maturity_date, next_interest_date, status) VALUES
    ( 1, 2, 20000.00, '2023-01-15', '2024-01-15', '2023-02-14', 'Matured'),  -- Amal,     1 year
    ( 3, 3, 40000.00, '2022-06-01', '2025-06-01', '2022-07-01', 'Active'),   -- Lasith,   3 years
    ( 5, 1, 50000.00, '2024-01-10', '2024-07-10', '2024-02-09', 'Matured'),  -- Tharaka,  6 months
    ( 6, 3, 70000.00, '2021-03-15', '2024-03-15', '2021-04-14', 'Matured'),  -- Nadeesha, 3 years
    ( 7, 2, 10000.00, '2024-01-01', '2025-01-01', '2024-01-31', 'Active'),   -- Saman,    1 year
    ( 9, 3, 85000.00, '2020-12-01', '2023-12-01', '2021-01-01', 'Matured'),  -- Roshan,   3 years
    (10, 1, 25000.00, '2024-03-01', '2024-09-01', '2024-03-31', 'Active'),   -- Kavya,    6 months
    (11, 2, 18000.00, '2023-09-01', '2024-09-01', '2023-10-01', 'Active'),   -- Hiruni,   1 year
    (12, 3, 50000.00, '2022-05-01', '2025-05-01', '2022-05-31', 'Active'),   -- Bimal,    3 years
    (14, 2,100000.00, '2023-10-01', '2024-10-01', '2023-10-31', 'Active');   -- Joint,    1 year
