from fastapi import APIRouter, Depends, HTTPException
from database import get_db

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", summary="Get dashboard summary stats and chart data")
def get_dashboard_stats(db=Depends(get_db)):
    cursor, _ = db
    try:
        # Total customers
        cursor.execute("SELECT COUNT(*) as cnt FROM CUSTOMER")
        total_customers = cursor.fetchone()["cnt"]

        # Total savings balance
        cursor.execute("SELECT COALESCE(SUM(current_balance), 0) as total FROM SAVINGSACCOUNT WHERE status = 'Active'")
        total_savings = float(cursor.fetchone()["total"])

        # Total fixed deposits principal
        cursor.execute("SELECT COALESCE(SUM(principal_amount), 0) as total FROM FIXEDDEPOSIT WHERE status = 'Active'")
        total_fds = float(cursor.fetchone()["total"])

        # Total interest paid
        cursor.execute("SELECT COALESCE(SUM(amount), 0) as total FROM BANK_TRANSACTION WHERE transaction_type = 'FD_Interest'")
        total_interest = float(cursor.fetchone()["total"])

        # Recent transactions
        cursor.execute("""
            SELECT 
                bt.transaction_id,
                bt.account_id,
                sa.account_number,
                bt.transaction_type,
                bt.amount,
                bt.reference_no,
                bt.transaction_timestamp
            FROM BANK_TRANSACTION bt
            LEFT JOIN SAVINGSACCOUNT sa ON bt.account_id = sa.account_id
            ORDER BY bt.transaction_timestamp DESC
            LIMIT 5
        """)
        recent_txns = cursor.fetchall()

        # Monthly chart data (last 6 months)
        cursor.execute("""
            SELECT 
                DATE_FORMAT(transaction_timestamp, '%b') as name,
                SUM(amount) as balance
            FROM BANK_TRANSACTION
            GROUP BY YEAR(transaction_timestamp), MONTH(transaction_timestamp), DATE_FORMAT(transaction_timestamp, '%b')
            ORDER BY YEAR(transaction_timestamp) DESC, MONTH(transaction_timestamp) DESC
            LIMIT 6
        """)
        chart_data = list(reversed(cursor.fetchall()))

        return {
            "total_customers": total_customers,
            "total_savings": total_savings,
            "total_fds": total_fds,
            "total_interest": total_interest,
            "recent_transactions": recent_txns,
            "chart_data": chart_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
