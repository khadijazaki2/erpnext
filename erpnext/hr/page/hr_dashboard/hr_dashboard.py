import frappe
from datetime import datetime
from frappe.utils import add_to_date, date_diff, getdate, nowdate, get_last_day, formatdate

@frappe.whitelist()
def get_current_presence():
    company = frappe.defaults.get_user_default("company")
    total_employees = frappe.db.sql("""select count(name) from `tabEmployee` where status = 'Active' and company = %s""", company, as_list=1)[0][0]
    total_presents = frappe.db.sql("""select count(name) from `tabAttendance` where attendance_date = CURDATE() and status = 'Present' and company = %s""", company, as_list=1)[0][0]
    total_leaves = frappe.db.sql("""select count(name) from `tabAttendance` where attendance_date = CURDATE() and status = 'On Leave' and company = %s""", company, as_list=1)[0][0]
    total_half = frappe.db.sql("""select count(name) from `tabAttendance` where attendance_date = CURDATE() and status = 'Half Day' and company = %s""", company, as_list=1)[0][0]
    total_absents = total_employees - (total_presents + total_leaves + total_half)
    chart = {
        "data": {
        'labels': ['Present', 'Absent', 'On Leave', 'Half Day'],
        'datasets': [{
            'label': '# of Votes',
            'data': [total_presents, total_absents, total_leaves, total_half],
            'backgroundColor': [
                '#4f1ebb',
                '#aaa3d0',
                '#ff5858',
                '#65b9aa'
            ],
        }]
    }
    }
    chart["present"] = total_presents
    chart["absent"] = total_absents
    chart["leave"] = total_leaves
    chart["half"] = total_half
    return chart

@frappe.whitelist()
def get_pendings():
    company = frappe.defaults.get_user_default("company")
    pending_att = frappe.db.sql("""select count(name) from `tabAttendance Request` where docstatus = 0 and company = %s""", company, as_list=1)[0][0]
    late_entry = frappe.db.sql("""select count(name) from `tabAttendance` where attendance_date = CURDATE() and late_entry = 1 and company = %s""", company, as_list=1)[0][0]
    early_exit = frappe.db.sql("""select count(name) from `tabAttendance` where attendance_date = CURDATE() and early_exit = 1 and company = %s""", company, as_list=1)[0][0]
    leave_app = frappe.db.sql("""select count(name) from `tabLeave Application` where docstatus = 0 and company = %s""", company, as_list=1)[0][0]
    p = {
        "pending_att": pending_att,
        "late_entry": late_entry,
        "early_exit": early_exit,
        "leave_app": leave_app
    }
    return p