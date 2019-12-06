import frappe
from datetime import datetime
from frappe.utils import add_to_date, date_diff, getdate, nowdate, get_last_day, formatdate, now_datetime
from erpnext.accounts.dashboard_chart_source.account_balance_timeline.account_balance_timeline import build_result
from frappe.core.page.dashboard.dashboard import get_from_date_from_timespan

@frappe.whitelist()
def test():
    company = frappe.defaults.get_user_default("company")
    expense = len(frappe.get_list('Expense Claim', filters=[["company", "=", company], ["approval_status", "=", "Draft"]]))
    loan = len(frappe.get_list('Loan Application', filters=[["company", "=", company], ["status", "=", "Open"]]))
    promotion = len(frappe.get_list('Employee Promotion', filters=[["company", "=", company], ["docstatus", "=", "Draft"]]))
    transfer = len(frappe.get_list('Employee Transfer', filters=[["company", "=", company], ["docstatus", "=", "Draft"]]))
    onboarding = len(frappe.get_list('Employee Onboarding', filters=[["company", "=", company], ["boarding_status", "=", "Pending"]]))
    separation = len(frappe.get_list('Employee Separation', filters=[["company", "=", company], ["boarding_status", "=", "Pending"]]))
    print(expense, loan, promotion, transfer, onboarding, separation)