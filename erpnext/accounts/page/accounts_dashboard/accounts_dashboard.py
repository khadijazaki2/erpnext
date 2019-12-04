import frappe
from datetime import datetime
from frappe.utils import add_to_date, date_diff, getdate, nowdate, get_last_day, formatdate
from erpnext.accounts.dashboard_chart_source.account_balance_timeline.account_balance_timeline import build_result, get_dates_from_timegrain, get_gl_entries
from erpnext.accounts.report.profit_and_loss_statement.profit_and_loss_statement import execute
from frappe.core.page.dashboard.dashboard import get_from_date_from_timespan
from frappe.desk.doctype.dashboard_chart.dashboard_chart import get_period_ending

@frappe.whitelist()
def get_bank_balances():
    #get the default company
    company = frappe.defaults.get_user_default("company")
    if not company:
        frappe.throw(_("No default company found. Set default company in Session Defaults"))
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
			dict(posting_date = ('<=', to_date)),
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
    if invoice_type == 'Sales Invoice':
        frappe.cache().hset('i_span', frappe.session.user, timespan)
    if invoice_type == 'Purchase Invoice':
        frappe.cache().hset('ip_span', frappe.session.user, timespan)
    paid_invoices = frappe.get_list(invoice_type, filters=[["company", "=", company], ["status", "=", "Paid"], ["posting_date", ">=", from_date], ["posting_date", "<=", to_date]], fields=['status', 'grand_total'])
    unpaid_invoices = frappe.get_list(invoice_type, filters=[["company", "=", company], ["status", "=", "Unpaid"], ["posting_date", ">=", from_date], ["posting_date", "<=", to_date]], fields=['status', 'grand_total'])
    overdue_invoices = frappe.get_list(invoice_type, filters=[["company", "=", company], ["status", "=", "Overdue"], ["posting_date", ">=", from_date], ["posting_date", "<=", to_date]], fields=['status', 'grand_total'])
    paid_total = sum(p['grand_total'] for p in paid_invoices)
    unpaid_total = sum(u['grand_total'] for u in unpaid_invoices)
    overdue_total = sum(o['grand_total'] for o in overdue_invoices)
    chart = {
        "data": {
        'labels': ['Paid Invoices', 'Unpaid Invoices', 'Overdue'],
        'datasets': [{
            'label': '# of Votes',
            'data': [len(paid_invoices), len(unpaid_invoices), len(overdue_invoices)],
            'backgroundColor': [
                '#4f1ebb',
                '#aaa3d0',
                '#ff5858'
            ],
        }]
    }
    }
    chart["paid_total"] = paid_total
    chart["unpaid_total"] = unpaid_total
    chart["overdue_total"] = overdue_total
    chart["currency"] = currency
    return chart

@frappe.whitelist()
def get(chart = None):
    company = frappe.defaults.get_user_default("company")
    abbr = frappe.db.get_value("Company", company, 'abbr')
    chart = frappe._dict(frappe.parse_json(chart))
    timespan = chart.timespan
    timegrain = chart.time_interval
    frappe.cache().hset('sa_span', frappe.session.user, timespan)
    frappe.cache().hset('sa_interval', frappe.session.user, timegrain)
    account = 'Sales - ' + abbr
    to_date = nowdate()
    from_date = get_from_date_from_timespan(to_date, timespan)
    dates = get_dates_from_timegrain(from_date, to_date, timegrain)
    gl_entries = get_gl_entries(account, get_period_ending(to_date, timegrain))
    result = build_result(account, dates, gl_entries)
    return {
        "labels": [formatdate(r[0].strftime('%Y-%m-%d')) for r in result],
        "datasets": [{
            "name": account,
            "values": [r[1] for r in result]
            }]
    }

@frappe.whitelist()
def cache_dashboard_values():
    frappe.cache().hset("i_span", frappe.session.user, "Last Year")
    frappe.cache().hset("ip_span", frappe.session.user, "Last Year")
    frappe.cache().hset('pl_span', frappe.session.user, 'Quarterly')
    frappe.cache().hset('pl_chart', frappe.session.user, 'line')
    frappe.cache().hset('pl_from', frappe.session.user, frappe.defaults.get_user_default("fiscal_year"))
    frappe.cache().hset('pl_to', frappe.session.user, frappe.defaults.get_user_default("fiscal_year"))
    frappe.cache().hset('pl_navigable', frappe.session.user, 1)
    frappe.cache().hset('pl_values', frappe.session.user, 1)
    frappe.cache().hset('pl_fill', frappe.session.user, 1)
    frappe.cache().hset('pl_dots', frappe.session.user, 0)
    frappe.cache().hset('pl_line', frappe.session.user, 0)
    frappe.cache().hset('pl_heatline', frappe.session.user, 0)
    frappe.cache().hset('pl_stack', frappe.session.user, 0)
    frappe.cache().hset('cf_chart', frappe.session.user, 'bar')
    frappe.cache().hset('cf_span', frappe.session.user, 'Yearly')
    frappe.cache().hset('cf_from', frappe.session.user, frappe.defaults.get_user_default("fiscal_year"))
    frappe.cache().hset('cf_to', frappe.session.user, frappe.defaults.get_user_default("fiscal_year"))
    frappe.cache().hset('cf_navigable', frappe.session.user, 0)
    frappe.cache().hset('cf_values', frappe.session.user, 1)
    frappe.cache().hset('cf_fill', frappe.session.user, 1)
    frappe.cache().hset('cf_dots', frappe.session.user, 0)
    frappe.cache().hset('cf_line', frappe.session.user, 0)
    frappe.cache().hset('cf_heatline', frappe.session.user, 0)
    frappe.cache().hset('cf_stack', frappe.session.user, 0)
    frappe.cache().hset('sa_span', frappe.session.user, 'Last Year')
    frappe.cache().hset('sa_interval', frappe.session.user, 'Monthly')
    return True
 

@frappe.whitelist()
def get_cache_values():
    invoice_values, p_values, c_values, sales_values = {}, {}, {}, {}
    invoice = ['i_span', 'ip_span']
    p_chart = [ 'pl_chart', 'pl_span', 'pl_from', 'pl_to',
     'pl_navigable', 'pl_values', 'pl_fill', 'pl_dots', 'pl_line',
     'pl_heatline', 'pl_stack']
    c_chart = ['cf_chart', 'cf_span', 'cf_from', 'cf_to',
     'cf_navigable', 'cf_values', 'cf_fill', 'cf_dots', 'cf_line', 'cf_heatline',
     'cf_stack']
    sales = ['sa_span', 'sa_interval']
    for i in invoice:
        v = frappe.cache().hget(i, frappe.session.user)
        invoice_values[i] = v
    print(invoice_values)
    for p in p_chart:
        v = frappe.cache().hget(p, frappe.session.user)
        p_values[p] = v
    for c in c_chart:
        v = frappe.cache().hget(c, frappe.session.user)
        c_values[c] = v
    for s in sales:
        v = frappe.cache().hget(s, frappe.session.user)
        sales_values[s] = v
    cached_values = {
        'invoice_values': invoice_values,
        'p_values': p_values,
        'c_values': c_values,
        'sales_values': sales_values
    }
    return cached_values

@frappe.whitelist()
def set_custom_filters(filtername, filtervalue):
    if filtervalue == 'false':
        filtervalue = 0
    if filtervalue == 'true':
        filtervalue = 1
    frappe.cache().hset(filtername, frappe.session.user, filtervalue)