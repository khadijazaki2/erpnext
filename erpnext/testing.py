import frappe
from datetime import datetime
from frappe.utils import add_to_date, date_diff, getdate, nowdate, get_last_day, formatdate
from erpnext.accounts.dashboard_chart_source.account_balance_timeline.account_balance_timeline import build_result
from frappe.core.page.dashboard.dashboard import get_from_date_from_timespan

@frappe.whitelist()
def get_bank_balances():
    company = frappe.defaults.get_user_default("company")
    to_date = nowdate()
    from_date = get_from_date_from_timespan(to_date, 'Last Year')
    paid_invoices = frappe.get_list('Sales Invoice', filters=[["company", "=", company], ["status", "=", "Paid"], ["due_date", ">=", from_date], ["due_date", "<=", to_date]], fields=['status', 'grand_total'])
    unpaid_invoices = frappe.get_list('Sales Invoice', filters=[["company", "=", company], ["status", "=", "Unpaid"], ["due_date", ">=", from_date], ["due_date", "<=", to_date]], fields=['status', 'grand_total'])
    paid_total = sum(p['grand_total'] for p in paid_invoices)
    unpaid_total = sum(u['grand_total'] for u in unpaid_invoices)
    print(paid_invoices, unpaid_invoices, paid_total, unpaid_total)