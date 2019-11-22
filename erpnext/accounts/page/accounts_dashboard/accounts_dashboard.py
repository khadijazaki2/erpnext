import frappe
from datetime import datetime
from frappe.utils import add_to_date, date_diff, getdate, nowdate, get_last_day, formatdate
from erpnext.accounts.dashboard_chart_source.account_balance_timeline.account_balance_timeline import build_result
from erpnext.accounts.report.profit_and_loss_statement.profit_and_loss_statement import execute
from frappe.core.page.dashboard.dashboard import get_from_date_from_timespan

@frappe.whitelist()
def get_bank_balances():
    #get the default company
    company = frappe.defaults.get_user_default("company")
    currency = frappe.db.get_value("Company", company, 'default_currency')
    currency = frappe.db.get_value("Currency", currency, 'symbol')
    #get the bank account of company
    abbr = frappe.db.get_value("Company", company, 'abbr')
    account = 'Bank Accounts - ' + abbr
    #get non-group descendents of bank accounts
    lft, rgt = frappe.db.get_value('Account', account, ['lft', 'rgt'])
    accounts = [d["name"] for d in frappe.db.get_list('Account', {"lft": [">", lft], "rgt": ["<", rgt], "is_group": 0},
		"name", order_by='lft desc', limit_page_length=None, ignore_permissions=False)]
    to_date = nowdate()
    if not accounts:
        return 'No accounts found'
    dates = [to_date]
    accounts_balances = []
    #loop through all accounts and get their balances
    for a in accounts:
        gl_entries = frappe.db.get_all('GL Entry',
        fields = ['posting_date', 'debit', 'credit'],
        filters = [
			dict(posting_date = ('<', to_date)),
			dict(account = ('=', a))
		],
		order_by = 'posting_date asc')
        result = build_result(a, dates, gl_entries)
        accounts_balances.append(result[0][1])
    balances = dict(zip(accounts, accounts_balances))
    bal = {
        "balances": balances,
        "currency": currency
    }
    return bal

@frappe.whitelist()
def get_fiscal_years():
    fiscal_years = []
    fiscals = frappe.get_list('Fiscal Year', fields=['name'])
    for f in fiscals:
        fiscal_years.append(f.name)
    return fiscal_years

@frappe.whitelist()
def get_invoices(invoice_type, timespan, company):
    currency = frappe.db.get_value("Company", company, 'default_currency')
    currency = frappe.db.get_value("Currency", currency, 'symbol')
    to_date = nowdate()
    from_date = get_from_date_from_timespan(to_date, timespan)
    paid_invoices = frappe.get_list(invoice_type, filters=[["company", "=", company], ["status", "=", "Paid"], ["due_date", ">=", from_date], ["due_date", "<=", to_date]], fields=['status', 'grand_total'])
    unpaid_invoices = frappe.get_list(invoice_type, filters=[["company", "=", company], ["status", "=", "Unpaid"], ["due_date", ">=", from_date], ["due_date", "<=", to_date]], fields=['status', 'grand_total'])
    paid_total = sum(p['grand_total'] for p in paid_invoices)
    unpaid_total = sum(u['grand_total'] for u in unpaid_invoices)
    chart = {
        "data": {
        'labels': ['Paid Invoices', 'Unpaid Invoices'],
        'datasets': [{
            'label': '# of Votes',
            'data': [len(paid_invoices), len(unpaid_invoices)],
            'backgroundColor': [
                '#4f1ebb',
                '#aaa3d0'
            ],
        }]
    }
    }
    chart["paid_total"] = paid_total
    chart["unpaid_total"] = unpaid_total
    chart["currency"] = currency
    return chart