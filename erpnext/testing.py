import frappe
from datetime import datetime
from frappe.utils import add_to_date, date_diff, getdate, nowdate, get_last_day, formatdate
from erpnext.accounts.dashboard_chart_source.account_balance_timeline.account_balance_timeline import build_result
from frappe.core.page.dashboard.dashboard import get_from_date_from_timespan

@frappe.whitelist()
def test():
    company = frappe.defaults.get_user_default("company")
    total_employees = frappe.db.sql("""select count(name) from `tabEmployee` where status = 'Active' and company = %s""", company, as_list=1)[0][0]
    total_presents = frappe.db.sql("""select count(name) from `tab=Attendance` where attendance_date = CURDATE() and status = 'Present' company = %s""", company, as_list=1)[0][0]
    total_leaves = frappe.db.sql("""select count(name) from `tab=Attendance` where attendance_date = CURDATE() and status = 'On Leave' company = %s""", company, as_list=1)[0][0]
    total_half = frappe.db.sql("""select count(name) from `tab=Attendance` where attendance_date = CURDATE() and status = 'Half Day' company = %s""", company, as_list=1)[0][0]
    total_absents = total_employees - (total_presents + total_leaves + total_half)
    print(total_presents, total_absents, total_employees, total_half)