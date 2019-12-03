import frappe
from datetime import datetime
from frappe.utils import add_to_date, date_diff, getdate, nowdate, get_last_day, formatdate, now_datetime
from frappe.core.page.dashboard.dashboard import get_from_date_from_timespan

company = frappe.defaults.get_user_default("company")


@frappe.whitelist()
def get_current_presence():
    to_date = nowdate()
    total_employees = frappe.get_list('Employee', filters=[["company", "=", company], ["status", "=", "Active"]])
    # total_employees = frappe.db.sql("""select count(name) from `tabEmployee` where status = 'Active' and company = %s""", company, as_list=1)[0][0]
    total_presents = frappe.get_list('Attendance', filters=[["company", "=", company], ["attendance_date", "=", to_date], ["status", "=", "Present"]])
    total_leaves = frappe.get_list('Attendance', filters=[["company", "=", company], ["attendance_date", "=", to_date], ["status", "=", "On Leave"]])
    total_half = frappe.get_list('Attendance', filters=[["company", "=", company], ["attendance_date", "=", to_date], ["status", "=", "Half Day"]])
    # total_presents = frappe.db.sql("""select count(name) from `tabAttendance` where attendance_date = CURDATE() and status = 'Present' and company = %s""", company, as_list=1)[0][0]
    # total_leaves = frappe.db.sql("""select count(name) from `tabAttendance` where attendance_date = CURDATE() and status = 'On Leave' and company = %s""", company, as_list=1)[0][0]
    # total_half = frappe.db.sql("""select count(name) from `tabAttendance` where attendance_date = CURDATE() and status = 'Half Day' and company = %s""", company, as_list=1)[0][0]
    total_absents = len(total_employees) - (len(total_presents) + len(total_leaves) + len(total_half))
    chart = {
        "data": {
        'labels': ['Present', 'Absent', 'On Leave', 'Half Day'],
        'datasets': [{
            'label': '# of Votes',
            'data': [len(total_presents), total_absents, len(total_leaves), len(total_half)],
            'backgroundColor': [
                '#4f1ebb',
                '#aaa3d0',
                '#ff5858',
                '#65b9aa'
            ],
        }]
    }
    }
    chart["present"] = len(total_presents)
    chart["absent"] = total_absents
    chart["leave"] = len(total_leaves)
    chart["half"] = len(total_half)
    return chart

@frappe.whitelist()
def get_pendings():
    to_date = nowdate()
    pending_att = frappe.get_list('Attendance Request', filters=[["company", "=", company], ["docstatus", "=", 0]])
    late_entry = frappe.get_list('Attendance', filters=[["company", "=", company], ["attendance_date", "=", to_date], ["late_entry", "=", 1]])
    early_exit = frappe.get_list('Attendance', filters=[["company", "=", company], ["attendance_date", "=", to_date], ["early_exit", "=", 1]])
    leave_app = frappe.get_list('Leave Application', filters=[["company", "=", company], ["docstatus", "=", 0]])
    # pending_att = frappe.db.sql("""select count(name) from `tabAttendance Request` where docstatus = 0 and company = %s""", company, as_list=1)[0][0]
    # late_entry = frappe.db.sql("""select count(name) from `tabAttendance` where attendance_date = CURDATE() and late_entry = 1 and company = %s""", company, as_list=1)[0][0]
    # early_exit = frappe.db.sql("""select count(name) from `tabAttendance` where attendance_date = CURDATE() and early_exit = 1 and company = %s""", company, as_list=1)[0][0]
    # leave_app = frappe.db.sql("""select count(name) from `tabLeave Application` where docstatus = 0 and company = %s""", company, as_list=1)[0][0]
    p = {
        "pending_att": len(pending_att),
        "late_entry": len(late_entry),
        "early_exit": len(early_exit),
        "leave_app": len(leave_app)
    }
    return p

@frappe.whitelist()
def get_job_openings(timespan):
    to_date = nowdate()
    from_date = get_from_date_from_timespan(to_date, timespan)
    to_date = now_datetime()
    opened = frappe.get_list('Job Opening', filters=[["company", "=", company], ["status", "=", "Open"], ["creation", ">=", from_date], ["creation", "<=", to_date]], fields=['status'])
    closed = frappe.get_list('Job Opening', filters=[["company", "=", company], ["status", "=", "Closed"], ["creation", ">=", from_date], ["creation", "<=", to_date]], fields=['status'])
    chart = {
        "data": {
        'labels': ['Open', 'Closed'],
        'datasets': [{
            'label': '',
            'data': [len(opened), len(closed)],
            'backgroundColor': [
                '#65b9aa',
                '#ff5858'
            ],
        }]
    }
    }
    chart["open"] = len(opened)
    chart["closed"] = len(closed)
    chart["total"] = len(opened) + len(closed)
    return chart

@frappe.whitelist()
def get_job_offers(timespan):
    to_date = nowdate()
    from_date = get_from_date_from_timespan(to_date, timespan)
    offers = frappe.get_list('Job Offer', filters=[["company", "=", company], ["offer_date", ">=", from_date], ["offer_date", "<=", to_date]], fields=['status'])
    awaiting = sum(1 for row in offers if row['status'] == 'Awaiting Response')
    accepted = sum(1 for row in offers if row['status'] == 'Accepted')
    rejected = sum(1 for row in offers if row['status'] == 'Rejected')
    chart = {
        "data": {
        'labels': ['Awaiting Response', 'Accepted Offer', 'Rejected Offer'],
        'datasets': [{
            'label': '',
            'data': [awaiting, accepted, rejected],
            'backgroundColor': [
                '#aaa3d0',
                '#65b9aa',
                '#ff5858'
            ],
        }]
    }
    }
    chart["awaiting"] = awaiting
    chart["accepted"] = accepted
    chart["rejected"] = rejected
    chart["total"] = awaiting + accepted + rejected
    return chart

@frappe.whitelist()
def get_job_apps(timespan):
    to_date = nowdate()
    from_date = get_from_date_from_timespan(to_date, timespan)
    to_date = now_datetime()
    apps = frappe.db.sql("""SELECT s.status FROM `tabJob Applicant` s
     INNER JOIN `tabJob Opening` p ON s.job_title = p.name WHERE
      p.company = %s and s.creation between %s and %s""", (company, from_date, to_date), as_list = True)
    opened = sum(1 for row in apps if row[0] == 'Open')
    replied = sum(1 for row in apps if row[0] == 'Replied')
    rejected = sum(1 for row in apps if row[0] == 'Rejected')
    hold = sum(1 for row in apps if row[0] == 'Hold')
    accepted = sum(1 for row in apps if row[0] == 'Accepted')
    chart = {
        "data": {
        'labels': ['Open', 'Replied', 'Rejected', 'Hold', 'Accepted'],
        'datasets': [{
            'label': '',
            'data': [opened, replied, rejected, hold, accepted],
            'backgroundColor': [
                '#aaa3d0',
                '#4f1ebb',
                '#ff5858',
                '#7cd6fd',
                '#65b9aa'
            ],
        }]
    }
    }
    chart["open"] = opened
    chart["replied"] = replied
    chart["hold"] = hold
    chart["accepted"] = accepted
    chart["rejected"] = rejected
    chart["total"] = opened + replied + hold + accepted + rejected
    return chart

@frappe.whitelist()
def get_appraisal(timespan = 'Last Year'):
    to_date = nowdate()
    from_date = get_from_date_from_timespan(to_date, timespan)
    appraisals = frappe.get_list('Appraisal',filters=[["start_date", ">=", from_date], ["start_date", "<=", to_date]], fields=['total_score', 'status'])
    approved = sum(1 for row in appraisals if row['status'] == 'Submitted')
    drafts = sum(1 for row in appraisals if row['status'] == 'Draft')
    labels = ['Score(0-1)', 'Score(1.1-2)', 'Score(2.1-3)', 'Score(3.1-4)', 'Score(4.1-5)']
    level1 = sum(1 for row in appraisals if row['total_score'] >= 0 if row['total_score'] <= 1)
    level2 = sum(1 for row in appraisals if row['total_score'] >= 1.1 if row['total_score'] <= 2)
    level3 = sum(1 for row in appraisals if row['total_score'] >= 2.1 if row['total_score'] <= 3)
    level4 = sum(1 for row in appraisals if row['total_score'] >= 3.1 if row['total_score'] <= 4)
    level5 = sum(1 for row in appraisals if row['total_score'] >= 4.1 if row['total_score'] <= 5)
    datasets = [level1, level2, level3, level4, level5]
    chart = {
		"data": {
			'labels': labels,
			'datasets': [{'name': 'Performance','values': datasets}]
		}
	}
    chart["completed"] = approved
    chart["pending"] = drafts
    return chart