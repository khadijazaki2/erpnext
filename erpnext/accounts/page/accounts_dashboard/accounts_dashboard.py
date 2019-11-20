import frappe
from datetime import datetime
from frappe.utils import add_to_date, date_diff, getdate, nowdate, get_last_day, formatdate
from erpnext.accounts.dashboard_chart_source.account_balance_timeline.account_balance_timeline import build_result
from erpnext.accounts.report.profit_and_loss_statement.profit_and_loss_statement import execute

@frappe.whitelist()
def get_bank_balances():
    #get the default company
    company = frappe.defaults.get_user_default("company")
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
    return balances

@frappe.whitelist()
def get_fiscal_years():
    fiscal_years = []
    fiscals = frappe.get_list('Fiscal Year', fields=['name'])
    for f in fiscals:
        fiscal_years.append(f.name)
    return fiscal_years

@frappe.whitelist()
def get_energy_points_heatmap_data(user, date):
	return dict(frappe.db.sql("""select unix_timestamp(date(creation)), sum(points)
		from `tabEnergy Point Log`
		where
			date(creation) > subdate('{date}', interval 1 year) and
			date(creation) < subdate('{date}', interval -1 year) and
			user = '{user}' and
			type != 'Review'
		group by date(creation)
		order by creation asc""".format(user = user, date = date)))


@frappe.whitelist()
def get_energy_points_percentage_chart_data(user, field):
    result = frappe.db.get_all('Energy Point Log',
        filters = {'user': user, 'type': ['!=', 'Review']},
        group_by = field,
        order_by = field,
        fields = [field, 'ABS(sum(points)) as points'],
        as_list = True)

    return {
        "labels": [r[0] for r in result if r[0] != None],
        "datasets": [{
            "values": [r[1] for r in result]
        }]
    }

@frappe.whitelist()
def get_user_rank(user):
    month_start = datetime.today().replace(day=1)
    monthly_rank = frappe.db.get_all('Energy Point Log',
        group_by = 'user',
        filters = {'creation': ['>', month_start], 'type' : ['!=', 'Review']},
        fields = ['user', 'sum(points)'],
        order_by = 'sum(points) desc',
        as_list = True)

    all_time_rank = frappe.db.get_all('Energy Point Log',
        group_by = 'user',
        filters = {'type' : ['!=', 'Review']},
        fields = ['user', 'sum(points)'],
        order_by = 'sum(points) desc',
        as_list = True)

    return {
       'monthly_rank': [i+1 for i, r in enumerate(monthly_rank) if r[0] == user],
       'all_time_rank': [i+1 for i, r in enumerate(all_time_rank) if r[0] == user]
    }


@frappe.whitelist()
def update_profile_info(profile_info):
    profile_info = frappe.parse_json(profile_info)
    keys = ['location', 'interest', 'user_image', 'bio']

    for key in keys:
        if key not in profile_info:
            profile_info[key] = None

    user = frappe.get_doc('User', frappe.session.user)
    user.update(profile_info)
    user.save()
    return user

@frappe.whitelist()
def get_energy_points_list(start, limit, user):
    return frappe.db.get_list('Energy Point Log',
        filters = {'user': user, 'type': ['!=', 'Review']},
        fields = ['name','user', 'points', 'reference_doctype', 'reference_name', 'reason',
            'type', 'seen', 'rule', 'owner', 'creation', 'revert_of'],
        start = start,
        limit = limit,
        order_by = 'creation desc')
