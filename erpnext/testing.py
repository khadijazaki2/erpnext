import frappe
from datetime import datetime
from frappe.utils import add_to_date, date_diff, getdate, nowdate, get_last_day, formatdate, now_datetime
from erpnext.accounts.dashboard_chart_source.account_balance_timeline.account_balance_timeline import build_result
from frappe.core.page.dashboard.dashboard import get_from_date_from_timespan

@frappe.whitelist()
def test():
    company = frappe.defaults.get_user_default("company")
    timespan = 'Last Year'
    to_date = nowdate()
    from_date = get_from_date_from_timespan(to_date, timespan)
    appraisals = frappe.get_list('Appraisal',filters=[["start_date", ">=", from_date], ["start_date", "<=", to_date]], fields=['total_score', 'status'])
    approved = sum(1 for row in appraisals if row['status'] == 'Submitted')
    drafts = sum(1 for row in appraisals if row['status'] == 'Draft')
    level1 = sum(1 for row in appraisals if row['total_score'] >= 0 if row['total_score'] <= 1)
    level2 = sum(1 for row in appraisals if row['total_score'] >= 1.1 if row['total_score'] <= 2)
    level3 = sum(1 for row in appraisals if row['total_score'] >= 2.1 if row['total_score'] <= 3)
    level4 = sum(1 for row in appraisals if row['total_score'] >= 3.1 if row['total_score'] <= 4)
    level5 = sum(1 for row in appraisals if row['total_score'] >= 4.1 if row['total_score'] <= 5)
    datasets = []
    print(datasets.append(level1, level2, level3, level4, level5))
    print(level1, level2, level3, level4, level5)