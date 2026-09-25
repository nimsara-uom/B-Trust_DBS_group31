from fastapi import APIRouter, Depends, HTTPException
from typing import List
from mysql.connector import Error

from backend.database import get_db
from backend.models.report import (
    AgentTransactionSummaryResponse,
    AccountTransactionSummaryResponse,
    ActiveFDReportResponse,
    MonthlyInterestDistributionResponse,
    CustomerActivitySummaryResponse,
    MonthlyBankTransactionSummaryResponse
)
from backend.crud import reports as crud_reports

router = APIRouter(prefix = "/reports", tags = ["Reports"])

@router.get("/agent-transaction-summary", response_model = List[AgentTransactionSummaryResponse], summary = "Report 1: Agent-wise transaction summary")
def get_agent_transaction_summary(db = Depends(get_db)) -> List[AgentTransactionSummaryResponse]:
    cursor, _ = db
    try:
        return crud_reports.get_agent_transaction_summary(cursor)
    except Error:
        raise HTTPException(status_code = 500, detail = "Failed to generate report")

@router.get("/account-transaction-summary", response_model = List[AccountTransactionSummaryResponse], summary = "Report 2: Account-wise summary")
def get_account_transaction_summary(db = Depends(get_db)) -> List[AccountTransactionSummaryResponse]:
    cursor, _ = db
    try:
        return crud_reports.get_account_transaction_summary(cursor)
    except Error:
        raise HTTPException(status_code = 500, detail = "Failed to generate report")

@router.get("/active-fds", response_model = List[ActiveFDReportResponse], summary = "Report 3: Active FDs and next payout")
def get_active_fds(db = Depends(get_db)) -> List[ActiveFDReportResponse]:
    cursor, _ = db
    try:
        return crud_reports.get_active_fds_report(cursor)
    except Error:
        raise HTTPException(status_code = 500, detail = "Failed to generate report")

@router.get("/monthly-interest-distribution", response_model = List[MonthlyInterestDistributionResponse], summary = "Report 4: Monthly interest distribution summary")
def get_monthly_interest_distribution(db = Depends(get_db)) -> List[MonthlyInterestDistributionResponse]:
    cursor, _ = db
    try:
        return crud_reports.get_monthly_interest_distribution(cursor)
    except Error:
        raise HTTPException(status_code = 500, detail = "Failed to generate report")

@router.get("/customer-activity-summary", response_model = List[CustomerActivitySummaryResponse], summary = "Report 5: Customer activity summary")
def get_customer_activity_summary(db = Depends(get_db)) -> List[CustomerActivitySummaryResponse]:
    cursor, _ = db
    try:
        return crud_reports.get_customer_activity_summary(cursor)
    except Error:
        raise HTTPException(status_code = 500, detail = "Failed to generate report")

@router.get("/monthly-bank-transaction-summary", response_model = List[MonthlyBankTransactionSummaryResponse], summary = "Report 6: Monthly bank transaction summary")
def get_monthly_bank_transaction_summary(db = Depends(get_db)) -> List[MonthlyBankTransactionSummaryResponse]:
    cursor, _ = db
    try:
        return crud_reports.get_monthly_bank_transaction_summary(cursor)
    except Error:
        raise HTTPException(status_code = 500, detail = "Failed to generate report")