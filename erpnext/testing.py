import frappe
from datetime import datetime
from frappe.utils import add_to_date, date_diff, getdate, nowdate, get_last_day, formatdate
from erpnext.accounts.dashboard_chart_source.account_balance_timeline.account_balance_timeline import build_result

@frappe.whitelist()
def get_bank_balances():
    fiscal_years = []
    fiscals = frappe.get_list('Fiscal Year', fields=['name'])
    for f in fiscals:
        fiscal_years.append(f.name)
    print(fiscal_years)