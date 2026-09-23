from decimal import Decimal
from pydantic import BaseModel
from datetime import date

class AgentTransactionSummaryResponse(BaseModel):
    agent_id: int
    agent_name: str
    number_of_transactions: int
    total_amount: Decimal
    total_deposits: Decimal
    total_withdrawals: Decimal

class AccountTransactionSummaryResponse(BaseModel):
    account_number: str
    customer_name: str
    plan_name: str    
    number_of_transactions: int
    total_amount: Decimal
    current_balance: Decimal

class ActiveFDReportResponse(BaseModel):
    fd_id: int
    account_number: str
    plan_name: str
    customer_name: str
    principal_amount: Decimal
    interest_rate: Decimal
    start_date: date
    maturity_date: date
    next_interest_date: date

class MonthlyInterestDistributionResponse(BaseModel):
    year: int
    month: int
    fd_id: int
    account_number: str
    customer_name: str
    plan_name: str
    number_of_interest_credits: int
    total_interest_credited: Decimal
    

class CustomerActivitySummaryResponse(BaseModel):
    customer_name: str
    account_number: str
    number_of_transactions: int
    total_deposit: Decimal
    total_withdrawal: Decimal
    net_balance: Decimal